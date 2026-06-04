function requireLandlord(req, res, next) {
  const role = req.user?.role;

  if (!role || !['landlord', 'admin'].includes(role)) {
    res.status(403);
    throw new Error('Landlord access required.');
  }

  next();
}

module.exports = {
  requireLandlord,
};
