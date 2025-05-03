const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const multer = require('multer'); // Import multer
const router = express.Router();

const Trip = require('../models/Trip');
const protect = require('../middlewares/authMiddleware');

/* helper */
const sendError = (res, errors) =>
  res.status(400).json({ success: false, error: errors.array()[0].msg });

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const isDriver = (trip, userId) =>
  trip.driver.toString() === userId.toString();


// Configure Multer for file uploads (Memory Storage)
const storage = multer.memoryStorage();  //store in memory buffer
const upload = multer({ storage: storage }); // initialize multer

/* ───────────────────────────────────────────────
   1) CREATE TRIP  – POST /api/trips  (driver)
   ─────────────────────────────────────────────── */

router.post(
  '/',
  protect,
  upload.single('carImage'),  // Apply multer middleware
  [
    body('from').trim().notEmpty().withMessage('From is required'),
    body('fromLat').isFloat().withMessage('FromLat must be a float'),
    body('fromLng').isFloat().withMessage('FromLng must be a float'),
    body('to').trim().notEmpty().withMessage('To is required'),
    body('departureTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Invalid departure time format (HH:MM)'),
    body('distanceKm').isInt({ min: 1, max: 1000 }).withMessage('DistanceKm must be an integer between 1 and 1000'),
    body('estimatedDurationMinutes').isInt({ min: 1, max: 600 }).withMessage('EstimatedDurationMinutes must be an integer between 1 and 600'),
    body('cost').isFloat({ gt: 0 }).withMessage('Cost must be a positive float'),
    body('availableSeats').notEmpty().withMessage('AvailableSeats is required'),
    body('carModel').trim().notEmpty().withMessage('CarModel is required'),
    body('carColor').trim().notEmpty().withMessage('CarColor is required'),
    body('carLicensePlate').trim().notEmpty().withMessage('CarLicensePlate is required'),
    body('driverPreference').optional().isIn(['Any', 'Males Only', 'Females Only']).withMessage('Invalid driver preference'),
    body('passengerBagLimit').optional().isInt({ min: 0, max: 5 }).withMessage('PassengerBagLimit must be an integer between 0 and 5'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() }); // Return more detailed errors
    }

    try {
      const {
        from,
        fromLat,
        fromLng,
        to,
        departureTime,
        distanceKm,
        estimatedDurationMinutes,
        cost,
        availableSeats,
        carModel,
        carColor,
        carLicensePlate,
        driverPreference,
        passengerBagLimit,
      } = req.body;

      let carImage = null;
      let carImageType = null;

      if (req.file) {
        carImage = req.file.buffer; // Store the image as a Buffer
        carImageType = req.file.mimetype; // Store the MIME type
      }

      const trip = await Trip.create({
        driver: req.user._id,
        from,
        fromLat,
        fromLng,
        to,
        departureTime,
        distanceKm,
        estimatedDurationMinutes,
        cost,
        availableSeats,
        carModel,
        carColor,
        carLicensePlate,
        driverPreference,
        passengerBagLimit,
        carImage: carImage, // Save the image Buffer
        carImageType: carImageType,
      });

      res.status(201).json({ success: true, data: trip });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/* ───────────────────────────────────────────────
   2) PUBLIC LIST  – GET /api/trips
   ─────────────────────────────────────────────── */
router.get(
  '/',
  [
    query('status').optional().isIn(['active', 'full', 'completed', 'cancelled']).withMessage('Invalid status value'),
    query('minSeats').optional().isInt({ min: 1, max: 10 }).withMessage('MinSeats must be an integer between 1 and 10')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors);

    const { status, from, to, minSeats } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (from && from.trim().length >= 2) filter.from = new RegExp(from.trim(), 'i');
    if (to && to.trim().length >= 2) filter.to = new RegExp(to.trim(), 'i');
    if (minSeats) filter.availableSeats = { $gte: +minSeats };

    try {
      const trips = await Trip.find(filter)
        .select('-passengers -carImage -carImageType') // Exclude image data
        .populate('driver', 'firstName lastName')
        .skip(skip)
        .limit(limit);

      res.json({ success: true, data: trips, page, limit });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);
/* ───────────────────────────────────────────────
   3) BOOK TRIP – POST /api/trips/:id/book
   ─────────────────────────────────────────────── */
router.post(
  '/:id/book',
  protect,
  [param('id').isMongoId().withMessage('Invalid Trip ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors);

    try {
      const trip = await Trip.findById(req.params.id);
      if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

      if (trip.status !== 'active') return res.status(400).json({ success: false, error: 'Trip not bookable' });

      // prevent driver from booking his own trip
      if (trip.driver.equals(req.user._id)) {
        return res.status(400).json({ success: false, error: 'Driver cannot book own trip' });
      }

      if (trip.passengers.find(p => p.user.equals(req.user._id))) {
        return res.status(400).json({ success: false, error: 'Already booked' });
      }

      if (trip.availableSeats < 1) {
        return res.status(400).json({ success: false, error: 'No seats left' });
      }

      trip.passengers.push({ user: req.user._id });
      trip.availableSeats -= 1;

      if (trip.availableSeats === 0) trip.status = 'full';

      await trip.save();

      res.json({ success: true, data: trip });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);
/* ───────────────────────────────────────────────
   4) DRIVER: MY CREATED TRIPS  – GET /api/trips/my-trips
   ─────────────────────────────────────────────── */
router.get('/my-trips', protect, async (req, res) => {
  try {
    const trips = await Trip.find({ driver: req.user._id });
    res.json({ success: true, data: trips });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ───────────────────────────────────────────────
   5) PASSENGER: MY BOOKINGS – GET /api/trips/my-bookings
   ─────────────────────────────────────────────── */
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const trips = await Trip.find({ 'passengers.user': req.user._id })
      .populate('driver', 'firstName lastName');
    res.json({ success: true, data: trips });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ───────────────────────────────────────────────
   6) driver cancel Trip
   ─────────────────────────────────────────────── */
router.patch('/:id/cancel', protect, asyncHandler(async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (!isDriver(trip, req.user._id))
      return res.status(403).json({ message: 'Only driver can cancel' });

    if (trip.status !== 'active' && trip.status !== 'full')
      return res.status(400).json({ message: `Trip already ${trip.status}` });

    trip.status = 'cancelled';
    trip.cancelledAt = Date.now();
    trip.cancelReason = req.body.reason || 'Driver cancelled';
    await trip.save();

    res.json({ success: true, message: 'Trip cancelled', data: trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}));
/* ───────────────────────────────────────────────
   7) complete Trip
   ─────────────────────────────────────────────── */
router.patch('/:id/complete', protect, asyncHandler(async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (!isDriver(trip, req.user._id))
      return res.status(403).json({ message: 'Only driver can complete' });
    if (trip.status !== 'active' && trip.status !== 'full')
      return res.status(400).json({ message: `Trip already ${trip.status}` });

    trip.status = 'completed';
    trip.completedAt = Date.now();
    await trip.save();

    res.json({ success: true, message: 'Trip completed', data: trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}));
/* ───────────────────────────────────────────────
 8) passenger cancel booking - حاليا لاتستخدمونه لانه لجا ياكد خلاص ماينفع يكنسل
 ─────────────────────────────────────────────── */
router.patch('/:id/cancel-booking', protect, asyncHandler(async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const idx = trip.passengers.findIndex(p => p.user.equals(req.user._id));
    if (idx === -1) return res.status(400).json({ message: 'You are not booked on this trip' });

    const seatsFreed = trip.passengers[idx].seats;
    trip.passengers.splice(idx, 1);
    trip.availableSeats += seatsFreed;
    if (trip.status === 'full') trip.status = 'active';
    await trip.save();

    res.json({ success: true, message: 'Booking cancelled', data: trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}));

//fetch the trip details by id
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid Trip ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors);

    try {
      const trip = await Trip.findById(req.params.id)
        .populate('driver', 'firstName lastName');
      if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
      res.json({ success: true, data: trip });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);


module.exports = router;