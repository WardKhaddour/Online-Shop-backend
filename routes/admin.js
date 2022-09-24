const path = require('path');

const express = require('express');

const {
  getAddProductPage,
  postAddProduct,
  getProducts,
  postEditProduct,
  deleteProduct,
} = require('../controllers/adminController');

const router = express.Router();

const products = [];

// /admin/add-product => GET
router.get('/add-product', getAddProductPage);

router.get('/product', getProducts);

// /admin/add-product => POST
router.post('/add-product', postAddProduct);

router.get('/edit-product/:productId');

router.post('/edit-product', postEditProduct);

router.post('/delete-product', deleteProduct);

module.exports = router;
