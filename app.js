const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const multer = require('multer');

dotenv.config({ path: `${__dirname}/.env` });

const MongoDB_URI = process.env.MONGODB_CONNECTION;

const app = express();

const csurfProtection = csurf({ cookie: true });

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  )
    cb(null, true);
  else cb(null, false);
};

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

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(multer({ storage: fileStorage, fileFilter }).single('image'));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(cookieParser());

app.use(csurfProtection);

app.get('/api/v1/getcsrftoken', csurfProtection, (req, res) =>
  res.json({ csrfToken: req.csrfToken() })
);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/shop', shopRoutes);
app.use('/api/v1/auth', authRoutes);
app.use(get404Page);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    status: 'failed',
    message: 'An error occurred, please try again later',
  });
});

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
