const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const ConnectMongoDBSession = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const flash = require('connect-flash');

dotenv.config({ path: `${__dirname}/.env` });

const MongoDB_URI = process.env.MongoDB_URI;

const app = express();
const store = new ConnectMongoDBSession({
  uri: MongoDB_URI,
  collection: 'sessions',
});

const csurfProtection = csurf({ cookie: true });

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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(cookieParser());

app.use(csurfProtection);

app.use(async (req, res, next) => {
  try {
    if (!req.session.user) return next();
    const user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    next();
  }
});

app.get('/api/getcsrftoken', csurfProtection, (req, res) =>
  res.json({ csrfToken: req.csrfToken() })
);
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(get404Page);

mongoose
  .connect(MongoDB_URI)
  .then(result => {
    console.log('Connected to DB');
  })
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
