const express = require('express');
const protect = require('../middleware/protect');

const shopController = require('../controllers/shopController');

const router = express.Router();

router.get('/', shopController.getAllProducts);

router.get('/products', shopController.getAllProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', protect, shopController.getCart);

router.post('/cart', protect, shopController.postCart);

router.delete('/cart/:productId', protect, shopController.deleteFromCart);

router.post('/order', protect, shopController.postOrder);

router.get('/orders', protect, shopController.getOrders);

router.get('/orders/:orderId', protect, shopController.getInvoice);

module.exports = router;
