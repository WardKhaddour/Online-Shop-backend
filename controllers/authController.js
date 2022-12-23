const User = require('../models/userModel');

exports.postLogin = async (req, res, next) => {
  const user = await User.findById('63306391e4ee86ebadcc66a0');
  req.session.isLoggedIn = true;
  req.session.user = user;
  await req.session.save();
  res.status(200).json({
    Done: 'Done',
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    res.status(200).json({ status: 'success' });
  });
};
