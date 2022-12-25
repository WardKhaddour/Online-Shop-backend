const express = require('express');
const { check, body } = require('express-validator');
const User = require('../models/userModel');

const {
  postLogin,
  postLogout,
  postSignup,
  resetPassword,
  checkPasswordToken,
  updatePassword,
} = require('../controllers/authController');

const router = express.Router();

router.post(
  '/login',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and texts and at least 5 characters '
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  postLogin
);
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('email already exists');
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and texts and at least 5 characters '
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match');
        }
        return true;
      }),
  ],
  postSignup
);
router.post('/logout', postLogout);
router.post('/reset', resetPassword);
router.get('/reset/:token', checkPasswordToken);
router.post('/new-password', updatePassword);
module.exports = router;
