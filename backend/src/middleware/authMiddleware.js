const { verifyAccessToken, findUserById } = require('../models/userModel');

/**
 * Express middleware to authenticate API requests via Bearer Access Tokens.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token is required.', code: 'UNAUTHORIZED' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Access token expired or invalid.', code: 'TOKEN_EXPIRED' });
  }

  const user = await findUserById(decoded.id);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.', code: 'USER_NOT_FOUND' });
  }

  req.userId = user.id;
  req.user = user;
  next();
};

module.exports = authMiddleware;
