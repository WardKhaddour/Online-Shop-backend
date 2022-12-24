const express = require('express');
const protect = require('../middleware/protect');

const {
  postAddProduct,
  getProducts,
  postEditProduct,
  deleteProduct,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/products', getProducts);

router.post('/add-product', protect, postAddProduct);

router.post('/edit-product', protect, postEditProduct);

router.post('/delete-product',protect, deleteProduct);

module.exports = router;
