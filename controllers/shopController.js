const Product = require('../models/productModel');
const Order = require('../models/orderModel');

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);

    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const products = (await req.user.populate('cart.items.productId')).cart
      .items;
    res.status(200).json({
      data: products,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    await req.user.addToCart(product);
    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteFromCart = async (req, res, next) => {
  const { id } = req.body;

  try {
    await req.user.removeFromCart(id);

    res.status(200).json({ status: 'success' });
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    return next(error);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    const products = (
      await req.user.populate('cart.items.productId')
    ).cart.items.map(item => {
      return {
        quantity: item.quantity,
        product: { ...item.productId._doc },
      };
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user,
      },
      products,
    });
    await order.save();
    req.user.clearCart();
    res.status(200).json({ status: 'success' });
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    return next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id });
    res.status(200).json({ status: 'success', data: orders });
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    return next(error);
  }
};
