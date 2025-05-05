const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Trip = require('../models/Trip');
const protect = require('../middleware/protect');

const router = express.Router();

const isAdmin = (req, res, next) => {
  console.log('--- isAdmin Middleware --- User:', req.user);
  if (req.user && req.user.isAdmin) {
    return next();
  } else {
    console.log('--- isAdmin Middleware --- Forbidden Access:', { hasUser: !!req.user, isAdmin: req.user?.isAdmin });
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

router.get('/users', protect, isAdmin, async (req, res) => {
  console.log('--- Reached GET /api/admin/users Route Handler ---');
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

router.get('/users/:userId/trips', protect, isAdmin, async (req, res) => {
  const userId = req.params.userId;
  console.log(`--- Backend: Fetching trips where driver is User ID: ${userId} ---`);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`--- Backend: Invalid User ID format received: ${userId} ---`);
      return res.status(400).json({ message: 'Invalid User ID format' });
  }

  try {
    console.log(`--- Backend: Querying Trip.find({ driver: "${userId}" }) ---`);
    const trips = await Trip.find({ driver: userId });
    console.log(`--- Backend: Found trips result:`, trips);
    res.json(trips);
  } catch (error) {
    console.error(`Error in GET /api/admin/users/:userId/trips:`, error);
    res.status(500).json({ message: 'Server error fetching user trips' });
  }
});


router.put('/users/:userId/ban', protect, isAdmin, async (req, res) => {
  console.log(`--- Reached PUT /api/admin/users/${req.params.userId}/ban Route Handler ---`);
  try {
    const userId = req.params.userId;
    if (req.user._id.toString() === userId) {
        return res.status(400).json({ message: "Admin cannot ban themselves." });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid User ID format' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isBanned = !user.isBanned;
    await user.save();
    console.log(`User ${userId} ban status toggled to: ${user.isBanned}`);
    res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, isBanned: user.isBanned });
  } catch (error) {
    console.error(`Error in PUT /api/admin/users/:userId/ban:`, error);
    res.status(500).json({ message: 'Server error updating ban status' });
  }
});

router.delete('/trips/:tripId', protect, isAdmin, async (req, res) => {
  console.log(`--- Reached DELETE /api/admin/trips/${req.params.tripId} Route Handler ---`);
  try {
    const tripId = req.params.tripId;
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(400).json({ message: 'Invalid Trip ID format' });
    }
    const trip = await Trip.findByIdAndDelete(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    console.log(`Trip ${tripId} deleted successfully.`);
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error(`Error in DELETE /api/admin/trips/:tripId:`, error);
    res.status(500).json({ message: 'Server error deleting trip' });
  }
});

router.delete('/users/:userId', protect, isAdmin, async (req, res) => {
  const userIdToDelete = req.params.userId;
  console.log(`--- Reached DELETE /api/admin/users/${userIdToDelete} Route Handler ---`);

  if (req.user._id.toString() === userIdToDelete) {
    console.log(`--- Attempt to self-delete denied for admin ID: ${req.user._id} ---`);
    return res.status(400).json({ message: "Admin cannot delete their own account." });
  }

  if (!mongoose.Types.ObjectId.isValid(userIdToDelete)) {
    console.log(`--- Invalid User ID format for deletion: ${userIdToDelete} ---`);
    return res.status(400).json({ message: 'Invalid User ID format' });
  }

  try {
    console.log(`--- Attempting to delete user with ID: ${userIdToDelete} ---`);
    const deletedUser = await User.findByIdAndDelete(userIdToDelete);

    if (!deletedUser) {
      console.log(`--- User not found for deletion with ID: ${userIdToDelete} ---`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`--- User deleted successfully: ID ${userIdToDelete} ---`);
    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error(`Error in DELETE /api/admin/users/:userId:`, error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

module.exports = router;