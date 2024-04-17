const express = require('express');
const router = express.Router();
const beanController = require('../controllers/beanController');

// Initialize the menu database
beanController.initializeDatabase().then(() => {
  // GET /api/bean
  router.get('/', beanController.getMenu);
});

// POST Orders
router.post("/order", beanController.validateOrders, beanController.postOrder ); 

// GET STATUS/ Ordernummer
router.get("/order/status/:orderNr", beanController.getOrderStatus );

module.exports = router;