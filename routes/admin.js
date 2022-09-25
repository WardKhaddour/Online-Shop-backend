const express = require('express');

const {
  postAddProduct,
  getProducts,
  postEditProduct,
  deleteProduct,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/products', getProducts);

router.post('/add-product', postAddProduct);

router.post('/edit-product', postEditProduct);

router.post('/delete-product', deleteProduct);

module.exports = router;
