const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:8080',
  })
);

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { get404Page } = require('./controllers/errorController');
const { mongoConnect } = require('./util/database');
const User = require('./models/userModel');

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(async (req, res, next) => {
  try {
    const user = await User.findById('632f6307b23bc5e8b8e9bfaf');
    req.user = new User(user.name, user.email, user.cart, user._id);
    next();
  } catch (err) {
    console.log(err);
    next();
  }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(get404Page);

mongoConnect(() => {
  app.listen(3000);
});
