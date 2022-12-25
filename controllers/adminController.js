const Product = require('../models/productModel');
const { validationResult } = require('express-validator');

exports.postAddProduct = async (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors });
  }
  try {
    const product = new Product({
      title,
      price,
      description,
      imageUrl,
      userId: req.user._id,
    });
    await product.save();

    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.log(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors });
  }
  try {
    const { id, title, price, imageUrl, description } = req.body;

    const product = await Product.findById(id);
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'unauthorized' });
    }
    product.title = title;
    product.price = price;
    product.imageUrl = imageUrl;
    product.description = description;
    await product.save();

    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.deleteOne({ _id: req.body.id, userId: req.user._id });

    res.status(200).json({
      status: 'success',
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id }).populate(
      'userId'
    );
    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (err) {
    console.log(err);
  }
};
