const auth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated. Please login.' 
    });
  }
  next();
};

module.exports = auth;