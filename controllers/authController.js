const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

exports.postLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ message: 'Validation error', errors: errors.array()[0].msg });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credential error' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ message: 'Credential error' });

    req.session.isLoggedIn = true;
    req.session.user = user;
    await req.session.save();
    res.status(200).json({
      Done: 'Done',
    });
  } catch (err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
  }
};

exports.postSignup = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation error', errors: errors.array()[0].msg });
  }
  try {
    const hashedPas = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPas,
      cart: { items: [] },
    });
    await user.save();
    res.status(201).json({
      message: 'success',
    });
  } catch (err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    res.status(200).json({ status: 'success' });
  });
};

exports.resetPassword = async (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) return res.status(400).json({ message: 'No email found' });
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        var transport = nodemailer.createTransport({
          host: 'smtp.mailtrap.io',
          port: 2525,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        transport.sendMail({
          to: req.body.email,
          from: 'ward@node.js',
          subject: 'password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:8080/reset/${token}">link</a> to set a new password</p>
          `,
        });
        console.log('sending mail');
        res.status(200).json({ message: 'email sent successfully' });
      })
      .catch(err => {
            const error = new Error(err);
            error.status = 500;
            return next(error);
      });
  });
};

exports.checkPasswordToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({ message: 'unauthorized' });
    }
    res.status(200).json({ passwordToken: token, userId: user._id.toString() });
  } catch (err) {
    const error = new Error(err);
    error.status = 500;
    return next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { newPassword, userId, passwordToken } = req.body;
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: new ObjectId(userId),
    });
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    console.log('Done');
    res.status(200).json({ message: 'password changed ' });
  } catch (err) {
        const error = new Error(err);
        error.status = 500;
        return next(error);
  }
};
