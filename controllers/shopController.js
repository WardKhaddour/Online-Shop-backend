const fs = require('fs');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const path = require('path');
const PDFDocument = require('pdfkit');

const ITEMS_PER_PAGE = 1;

exports.getAllProducts = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;

    const productsCount = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.status(200).json({
      status: 'success',
      data: {
        products,
        productsCount,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < productsCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(productsCount / ITEMS_PER_PAGE),
      },
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
    const user = await User.findById(req.userId);
    const products = (await user.populate('cart.items.productId')).cart.items;
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
    const userPromise = User.findById(req.userId);
    const productPromise = Product.findById(productId);
    Promise.all([productPromise, userPromise])
      .then(values => {
        const [product, user] = values;
        return user.addToCart(product);
      })
      .then(() => {
        res.status(200).json({ status: 'success' });
      });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteFromCart = async (req, res, next) => {
  const { productId } = req.params;

  try {
    await req.user.removeFromCart(productId);

    res.status(200).json({ status: 'success' });
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    return next(error);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const products = (
      await user.populate('cart.items.productId')
    ).cart.items.map(item => {
      return {
        quantity: item.quantity,
        product: { ...item.productId._doc },
      };
    });
    const order = new Order({
      user: {
        email: user.email,
        userId: user,
      },
      products,
    });
    await order.save();
    user.clearCart();
    res.status(200).json({ status: 'success' });
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    return next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'user.userId': req.userId });
    res.status(200).json({ status: 'success', data: orders });
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    return next(error);
  }
};

exports.getInvoice = async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new Error('No order found!'));
  }
  if (!order.user.userId.equals(req.userId.toString())) {
    return next(new Error('Unauthorized'));
  }
  const invoiceName = `invoice-${orderId}.pdf`;
  const invoicePath = path.join('data', 'invoices', invoiceName);

  const pdfDoc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
  res.setHeader('filename', invoiceName);
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);

  pdfDoc.fontSize(26).text('Invoice', { underline: true });
  pdfDoc.text('-----------');
  let totalPrice = 0;
  order.products.forEach(prod => {
    totalPrice += prod.quantity * prod.product.price;
    pdfDoc
      .fontSize(14)
      .text(`${prod.product.title}-${prod.quantity}x $${prod.product.price}`);
  });
  pdfDoc.text('-----------');

  pdfDoc.fontSize(20).text(`Total price: $${totalPrice}`);
  pdfDoc.end();

  // const file = fs.createReadStream(invoicePath);

  // file.pipe(res);
};
