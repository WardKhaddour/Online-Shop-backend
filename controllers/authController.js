const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.postLogin = async (req, res, next) => {
  try {
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
    console.log(err);
  }
};

exports.postSignup = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  try {
    const userDoc = await User.findOne({ email });
    if (userDoc) {
      return res.status(400).json({
        message: 'email already exists',
      });
    }
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
    console.log(err);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    res.status(200).json({ status: 'success' });
  });
};
