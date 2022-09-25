const express = require('express');

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
} = require('../controllers/shopController');

const router = express.Router();

router.get('/', getIndex);

router.get('/products', getAllProducts);

router.get('/products/:productId', getProduct);

router.get('/cart', getCart);

router.post('/cart', postCart);

router.post('/cart-delete-product', deleteFromCart);

router.post('/create-order', postOrder);

router.get('/orders', getOrders);

module.exports = router;
