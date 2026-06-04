const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await User.update(req.user.id, req.body);

  if (!updatedUser) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.json(updatedUser);
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.list({
    role: req.query.role,
    limit: req.query.limit,
    offset: req.query.offset,
  });

  res.json({ users });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.json({ user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const removedUser = await User.remove(req.params.id);

  if (!removedUser) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.json({ message: 'User deleted.', user: removedUser });
});

module.exports = {
  deleteUser,
  getProfile,
  getUser,
  listUsers,
  updateProfile,
};
