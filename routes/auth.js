const express = require('express');

const {
  postLogin,
  postLogout,
  postSignup,
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', postLogin);
router.post('/signup', postSignup);
router.post('/logout', postLogout);

module.exports = router;
