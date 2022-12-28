const express = require('express');
const protect = require('../middleware/protect');

const {
  getAllProducts,
  getProduct,
  getIndex,
  getCart,
  getCheckout,
  getOrders,
  postCart,
  deleteFromCart,
  postOrder,
  getInvoice,
} = require('../controllers/shopController');

const router = express.Router();

router.get('/', getAllProducts);

router.get('/products', getAllProducts);

router.get('/products/:productId', getProduct);

router.get('/cart', protect, getCart);

router.post('/cart', protect, postCart);

router.post('/cart-delete-product', protect, deleteFromCart);

router.post('/create-order', protect, postOrder);

router.get('/orders', protect, getOrders);

router.get('/orders/:orderId', protect, getInvoice);

module.exports = router;
