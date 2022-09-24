const Product = require('../models/productModel');

exports.getAddProductPage = (req, res, next) => {
  // res.render('admin/add-product', {
  //   pageTitle: 'Add Product',
  //   path: '/admin/add-product',
  //   formsCSS: true,
  //   productCSS: true,
  //   activeAddProduct: true,
  // });
  // res.status(200).json({
  //   status: 'success',
  // })
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  req.user
    .createProduct({
      title,
      price,
      imageUrl,
      description,
    })
    // Product.create()
    .then(() => {
      // console.log(res);
      console.log('Created');
      res.status(200).json({ status: 'success' });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) return res.redirect('/');
  const { productId } = req.params;
  Product.findById(productId, product => {
    if (!product) return redirect('/');
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/add-product',
      editing: editMode,
      product,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { id, title, price, imageUrl, description } = req.body;
  Product.findByPk(id)
    .then(product => {
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;
      return product.save();
    })
    .then(() => {
      res.status(200).json({ status: 'success' });
    })
    .catch(err => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
  Product.findByPk(req.body.id)
    .then(product => {
      return product.destroy();
    })
    .then(() =>
      res.status(200).json({
        status: 'success',
      })
    );
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then(res => {
      res.status(200).json({
        status: 'success',
        data: products,
      });
    })
    .catch(err => console.log(err));
};
