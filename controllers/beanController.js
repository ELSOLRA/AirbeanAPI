const menuDb = require('../models/beanModel');
const ordersDb = require('../models/ordersModel');
const fs = require('fs').promises;
const { getLoggedId } = require('../utils/loggedUser')
const { orderNr, calculateRemainingTime } = require('../utils/utils')

//Starta menu.Db
async function initializeDatabase() {
    try {
        // Kolla om dokument finns i Db
        const count = await menuDb.count({});
        if (count === 0) {
            try {
                const data = await fs.readFile('menu.json', 'utf8');
                const jsonData = JSON.parse(data);
                const newDoc = await menuDb.insert(jsonData.menu);
                console.log('Inserted document:', newDoc);
            } catch (err) {
                console.error('Error reading JSON file or inserting document:', err);
            }
        } else {
            console.log('Database already contains data. Skipping initialization.');
        }
    } catch (err) {
        console.error('Error checking database count or initializing database:', err);
    }
}

//Hämta menu från Db
async function getMenu(req, res) {
    try {
      const docs = await menuDb.find({});
      res.status(200).json({ success: true, menu: docs });
    } catch (err) {
      res.status(500).json({ success: false, message: err });
    }
  }

// POST order
  async function postOrder (req, res) {
    const loggedId = getLoggedId();
    const { orders } = req.body;
    const timestamp = new Date();
    const orderNumber = orderNr();
    const randomETA = Math.floor(Math.random() * 13) + 7;
    console.log("dsfdsafasfsafsaf",loggedId)
    try{
    await ordersDb.insert(
      { orders, eta: randomETA, orderNr: orderNumber, timestamp, loggedId },
      (err) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Failed to save order to database" });
        }
        res.json({
          eta: randomETA,
          orderNr: orderNumber,
  
        });
      }
    );
  
  } catch (error) {
    console.error('Error in POST /api/beans/order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
  }
  // Validering av orders och pris / varor.
  const validateOrders = async (req, res, next) => {
    const { details } = req.body;
    try {
      const menu = await menuDb.find({});

      if (!details || !details.order || !Array.isArray(details.order)) {
        return res.status(400).json({ error: "Orders should be an array" });
      }

      const invalidOrders =  details.order.filter((order) => {
        const foundItem = menu.find(
          (item) => item.title === order.name && item.price === order.price
        );
        return !foundItem;
      });

      if (invalidOrders.length > 0) {
        return res
          .status(400)
          .json({ error: "Invalid orders detected", invalidOrders });
      }

      req.body.orders = details.order;
      next();
    } catch (error) {
      console.error("Error in validateOrders:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }; 
  // GET order status
  async function getOrderStatus (req, res) {
    const orderNr = req.params.orderNr;
    try {
      const orders = await ordersDb.find({ orderNr: orderNr })
      const order = orders[0];

      const remainingTime = calculateRemainingTime(order);
      console.log(remainingTime)
      
        if (order.length === 0) {
          res.status(404).send("order not found");
        }
  
        if (!orderNr) {
          res.status(404).send("no order with that order num");
          return
        }
    
        res.status(200).json({ eta : remainingTime });  
        
      } catch (e) {
      res.status(500).send("server crashed");
    }
  }

// Exportera
module.exports = {
    initializeDatabase: initializeDatabase,
    getMenu,
    postOrder,
    orderNr,
    validateOrders,
    getOrderStatus

};