const express = require('express');
const { check } = require('express-validator/check');

const {
  postLogin,
  postLogout,
  postSignup,
  resetPassword,
  checkPasswordToken,
  updatePassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', postLogin);
router.post('/signup', postSignup);
router.post('/logout', postLogout);
router.post('/reset', resetPassword);
router.get('/reset/:token', checkPasswordToken);
router.post('/new-password', updatePassword);
module.exports = router;
