
const express = require("express");
const Datastore = require("nedb-promise");
const jwt = require('jsonwebtoken');
// const menu = require("./menu");
const app = express();
const PORT = process.env.PORT || 3000;
const { v4: uuidv4} = require('uuid');
const { log } = require("console");
const fs = require('fs').promises;
const moment = require('moment');

//Databas
const db = new Datastore({ filename: "database.db", autoload: true });
const menuDb = new Datastore ({ filename: "menu.db", autoload: true });
const ordersDb = new Datastore ({ filename: "orders.db", autoload: true });
const userId = uuidv4();
app.use(express.json());

let loggedId; 

//Generera tid vid  beställning




// Start countdown and send countdown value to frontend

//Generera ordernummer vid beställning
function orderNr() {
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var digits = '0123456789';
    var result = '';
    
    for (var i = 0; i < 3; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (var i = 0; i < 7; i++) {
        result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    
    return result;
}

//   ###########################################################################################################

async function initializeDatabase() {
    try {
        // Check if any documents exist in the database
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

// Call the initialization function before starting the server
initializeDatabase().then(() => {
  // GET MENU
  app.get('/api/beans', async (req, res) => {
    try {
      // Fetch all documents from the 'menu' collection
      const docs = await menuDb.find({});
      res.status(200).json({ success: true, menu: docs });
    } catch (err) {
      res.status(500).json({ success: false, message: err });
    }
  });
})

// GET STATUS/ Ordernummer
app.get("/api/beans/order/status/:orderNr", async (req, res) => {
  const orderNr = req.params.orderNr;
  try {
    const orders = await ordersDb.find({ orderNr: orderNr })
    // console.log(order);
    const order = orders[0];
    // console.log(timestamp, eta); 
    const remainingTime = calculateRemainingTime(order);
    console.log(remainingTime) 
  
    
      if (order.length === 0) {
        res.status(404).send("order not found");
      }

      if (!orderNr) {
        res.status(404).send("no order with that order num");
        return;
      }
  
      res.status(200).json({ success: true });
      
    } catch (e) {
    res.status(500).send("server crashed");
  }
});

// POST SIGNUP
app.post("/api/user/signup",  async (req, res) => {
    const { username, password} = req.body;
    const usernameExists = await db.findOne(user => db.username === username);
    const newSignup = {
      userId: userId,
      username: username,
      password: password
   }

    if (usernameExists) {
      res.status(400).json({ success: false, message: "User name already exists" });
      return;
    } 
    try{
        await db.insert(newSignup)
        res.status(201).json({ success: true})
    }catch (e){
        res.status(500).send("server crashed")
    }
  });

// POST Login
app.post("/api/user/login", async (req, res) => {
    const { username, password } = req.body;
    const newLogin = {
        username : username,
        password : password
    }

    // Validera username
    try{
        const loggedUser = await db.find( {username, password}) 
        loggedId = loggedUser[0].userId;
        console.log(newLogin)
        res.status(201).json({ success: true })
    }catch (e){
        res.status(500).send("server crashed")
    }
})

//GET Hämta en inloggad användares orderhistorik
app.get("/api/user/history/:userId", async (req, res) => {
    // Kolla ifall en token finns i headers:
    try {
        res.status(201).json({
  "success": true,
  "orderHistory": [
    {
      "total": 0,
      "orderNr": "string",
      "orderDate": "string"
    }
  ]
}
)
    } catch (error) {
    console.log(error); 
    }
})

// ###################################################################################

  const validateOrders = async (req, res, next) => {
    const { details } = req.body;
    try {
      const menu = await menuDb.find({});

      if (!details || !details.order || !Array.isArray(details.order)) {
        return res.status(400).json({ error: "Orders should be an array" });
      }

      const invalidOrders = details.order.filter((order) => {
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
 
// POST Orders
app.post("/api/bean/order",  validateOrders, async (req, res) => {
  const { orders } = req.body;
  const timestamp = new Date();
  const orderNumber = orderNr();
  // const countdownInterval = countdownETA(randomETA)
  const randomETA = Math.floor(Math.random() * 13) + 7;
  


  
  try{

  await ordersDb.insert(
    { orders, eta: randomETA, orderNr: orderNumber, timestamp, loggedId: loggedId },
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
  console.error('Error in POST /api/bean/order:', error);
  return res.status(500).json({ error: 'Internal server error' });
}
}); 

function calculateRemainingTime(order) {
  const { eta, timestamp } = order;
  console.log("order 0 : ", order);
  const orderTime = moment(timestamp);
  console.log("ordertime   :",orderTime);
  const currentTime = moment();
  console.log("NOW   :",currentTime);
  const elapsedTime = currentTime.diff(orderTime, 'minutes'); // Calculate elapsed time in minutes
  console.log("Tid gången :",elapsedTime);
  const remainingTime = Math.max(eta - elapsedTime, 0); // Calculate remaining time in minutes
  console.log("remaining:",remainingTime);

  return remainingTime;
  
}

/* const countdownETA = (eta) => {
  let countdown = eta * 60; // Convert ETA to seconds
  const interval = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(interval);
      console.log('Countdown completed');
    }
    // You can send countdown to the frontend here
    console.log(countdown); // For demonstration, you would send it to frontend instead
  }, 1000);
  return interval;
} */
// #############################################################################
//Starta servern
const server = app.listen(PORT, () =>
console.log(`Server listening at port ${PORT}...`));
