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

router.get('/products', getProducts);

router.post(
  '/add-product',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim(),
  ],
  protect,
  postAddProduct
);

router.post(
  '/edit-product',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim(),
  ],
  protect,
  postEditProduct
);

router.post('/delete-product', protect, deleteProduct);

module.exports = router;
