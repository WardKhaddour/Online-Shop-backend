const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const ConnectMongoDBSession = require('connect-mongodb-session')(session);

const MongoDB_URI =
  'mongodb+srv://ward_online_shop:ZtXRUhcXoVRV0JAl@cluster0.lmxpeih.mongodb.net/shop?w=majority';

const app = express();
const store = new ConnectMongoDBSession({
  uri: MongoDB_URI,
  collection: 'sessions',
});

app.use(
  cors({
    origin: 'http://localhost:8080',
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })
);

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const { get404Page } = require('./controllers/errorController');

const User = require('./models/userModel');

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.use((req, res, next) => {
  console.log('session', req.session);
  next();
});

app.use(async (req, res, next) => {
  try {
    if (!req.session.user) return next();
    const user = await User.findById(req.session.user._id);
    req.user = user;
    console.log('USER');
    console.log(user);
    next();
  } catch (err) {
    console.log(err);
    next();
  }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(get404Page);

mongoose
  .connect(MongoDB_URI)
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
