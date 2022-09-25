const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(
  cors({
    origin: 'http://localhost:8080',
  })
);

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { get404Page } = require('./controllers/errorController');

const User = require('./models/userModel');

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(async (req, res, next) => {
  try {
    const user = await User.findById('63306391e4ee86ebadcc66a0');
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    next();
  }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(get404Page);

mongoose
  .connect(
    'mongodb+srv://ward_online_shop:ZtXRUhcXoVRV0JAl@cluster0.lmxpeih.mongodb.net/shop?retryWrites=true&w=majority'
  )
  .then(result => {
    console.log('Connected to DB');
    User.findOne().then(user => {
      if (!user) {
        const newUser = new User({
          name: 'Ward',
          email: 'ward@example.com',
          cart: {
            items: [],
          },
        });
        return newUser.save();
      }
    });
  })
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
