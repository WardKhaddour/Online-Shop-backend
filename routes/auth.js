const express = require('express');
const { check, body } = require('express-validator');
const User = require('../models/userModel');

const authController = require('../controllers/authController');

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
  authController.login
);
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject('email already exists');
        }
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
  authController.signup
);
router.post('/logout', authController.logout);
router.post('/reset', authController.resetPassword);
router.get('/reset/:token', authController.checkPasswordToken);
router.post('/new-password', authController.updatePassword);
module.exports = router;
