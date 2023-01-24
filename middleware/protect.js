const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.get('Authorization')?.split(' ')[1];
  if (!token) {
    const error = new Error('Unauthenticated');
    error.statusCode = 401;
    throw error;
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      const error = new Error('Unauthenticated');
      error.statusCode = 401;
      throw error;
    }
    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  // if (!req.session.isLoggedIn)
  //   return res.status(401).json({ message: 'unauthorized' });
  // next();
};
