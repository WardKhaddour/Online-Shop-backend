module.exports = (req, res, next) => {
  if (!req.isLoggedIn) return res.status(401).json({ message: 'unauthorized' });
  next();
};
