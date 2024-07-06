const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateToken(user) {
  const token = jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
  return token; 
}

function verifyWebUser(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.decode(token); 

    const userType = decoded.user.userType;

    if (userType !== 1 && userType !== 2 && userType !== 3) {
      return res.status(403).json({ status: 'failed', message: 'Access denied. User does not have permission to access this resource.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'failed', message: 'Invalid token' });
  }
}

function verifyAppUser(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const userType = decoded.user.userType;
    
    if (userType !== 4 && userType !== 5 && userType !== 6 && userType !== 7) {
      return res.status(403).json({ status: 'failed', message: 'Access denied. User does not have permission to access this resource.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'failed', message: 'Invalid token' });
  }
}


function verifyCommonUser(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.decode(token); 
    const userType = decoded.user.userType;
    if (!userType) {
      return res.status(403).json({ status: 'failed', message: 'Access denied. User does not have permission to access this resource.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ status: 'failed', message: 'Invalid token' });
  }
}

module.exports = {
  generateToken,
  verifyWebUser, 
  verifyAppUser,
  verifyCommonUser
};
