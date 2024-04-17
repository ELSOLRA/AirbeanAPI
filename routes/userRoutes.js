const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController')

// POST SIGNUP
router.post("/signup", usersController.postSignUp);

// POST Login
router.post("/login",usersController.postLogin )

//GET Hämta en inloggad användares orderhistorik
router.get("/history/:userId", usersController.getOrders);

//Exportera routers
   module.exports =  router;


