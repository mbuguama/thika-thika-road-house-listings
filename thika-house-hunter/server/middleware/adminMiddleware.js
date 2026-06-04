function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Admin access required.');
  }

  next();
}

module.exports = {
  requireAdmin,
};
