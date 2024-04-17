const db = require("../models/usersModel");
const ordersDb = require("../models/ordersModel");
const moment = require('moment');
const { v4: uuidv4} = require('uuid');
const userId = uuidv4();
const { setLoggedId } = require('../utils/loggedUser');

//Funktion för signup
async function postSignUp (req, res) {
    const { username, password} = req.body;
    const usernameExists = await db.findOne({username: username});
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
};

//Funktion för login
async function postLogin (req, res) {
    const { username, password } = req.body;
    const newLogin = {
        username : username,
        password : password
    }
    // Validera username
    try{
        const loggedUser = await db.find( {username, password}) 
        let loggedId = loggedUser[0].userId; 
        setLoggedId(loggedId); 
        res.status(201).json({ success: true })
        
    }catch (e){
        res.status(500).send("server crashed")
    }
}

//Funktion for order history
async function getOrders (req, res) {
    try {
    const userId = req.params.userId;
    if(!userId) {
      return res.status(400).json({error: 'User Id required'});
    }
      const userOrders = await ordersDb.find({ loggedId: userId });
  /*     const ordersAmount =  userOrders.length */
  
      if (userOrders.length === 0) {
        return res.status(404).json({ error: "No orders found for the user" });
      }
  
      const orderHistory  = userOrders.map((order) => ({
        orderNr : order.orderNr ,
        timestamp : moment(order.timestamp).format('YYYY-MM-DD'),
        total : order.orders.reduce((sum, item) => sum + item.price, 0)
      }));
  
    res.status(200).json({ 
      success: true, 
      orderHistory: orderHistory.map(order => ({
        total: order.total,
        orderNr: order.orderNr,
        orderDate: order.timestamp
      }))
  });

  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
    postSignUp,
    postLogin,
    getOrders,
    postLogin,
}