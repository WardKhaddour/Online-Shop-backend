const express = require('express');
const protect = require('../middleware/protect');
const { body } = require('express-validator');

const {
  postAddProduct,
  getProducts,
  postEditProduct,
  deleteProduct,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/products', protect, getProducts);

router.post(
  '/product',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim(),
  ],
  protect,
  postAddProduct
);

router.patch(
  '/product',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim(),
  ],
  protect,
  postEditProduct
);

router.delete('/product/:productId', protect, deleteProduct);

module.exports = router;
