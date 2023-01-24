const Product = require('../models/productModel');
const { validationResult } = require('express-validator');
const { deleteFile } = require('../util/file');

exports.postAddProduct = async (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  if (!image) {
    return res.status(422).json({ status: 'failed', data: 'error in image' });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).json({ errors });
  }
  try {
    const imageUrl = image.path;
    const product = new Product({
      title,
      price,
      description,
      imageUrl,
      userId: req.userId,
    });
    await product.save();
    res.status(200).json({ status: 'success' });
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    console.log(err);
    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors });
  }
  try {
    const { id, title, price, description } = req.body;
    const image = req.file;
    const product = await Product.findById(id);
    if (product.userId.toString() !== req.userId.toString()) {
      return res.status(401).json({ message: 'unauthorized' });
    }

    product.title = title;
    product.price = price;
    if (image) {
      deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    product.description = description;
    await product.save();

    res.status(200).json({ status: 'success' });
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    return next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return next(new Error('Product not found'));

    await Product.deleteOne({ _id: productId, userId: req.userId });
    deleteFile(product.imageUrl);

    res.status(200).json({
      status: 'success',
    });
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    return next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.userId }).populate(
      'userId'
    );
    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    return next(error);
  }
};
