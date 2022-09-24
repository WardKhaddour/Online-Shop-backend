const Product = require('../models/productModel');

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();
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
  // Product.findAll({ where: { id: productId } })
  try {
    const product = await Product.findByPk(productId);

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
    const products = await Product.findAll();

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
    const cart = await req.user.getCart();
    const products = await cart.getProducts();
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
    let newQuantity = 1;
    const fetchedCart = await req.user.getCart();
    const products = await fetchedCart.getProducts({
      where: { id: productId },
    });
    let product;

    if (products.length) {
      product = products[0];
    }
    if (product) {
      //...
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
    }
    product = await Product.findByPk(productId);
    await fetchedCart.addProduct(product, {
      through: { quantity: newQuantity },
    });
    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteFromCart = async (req, res, next) => {
  const { id } = req.body;

  try {
    const cart = await req.user.getCart();
    const products = await cart.getProducts({ where: { id } });
    const product = products[0];
    await product.cartItem.destroy();
    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.log(err);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    const cart = await req.user.getCart();
    const products = await cart.getProducts();
    const order = await req.user.createOrder();
    const productsWithQty = products.map(product => {
      product.orderItem = { quantity: product.cartItem.quantity };
      return product;
    });

    await order.addProducts(productsWithQty);
    await cart.setProducts(null);
    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res, next) => {
  const orders = await req.user.getOrders({ include: ['products'] });
  res.status(200).json({ status: 'success', data: orders });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', { path: '/checkout', pageTitle: 'Checkout' });
};
