// routes/tripRoutes.js
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const multer = require('multer');
const router = express.Router();

const Trip = require('../models/Trip');
const protect = require('../middlewares/authMiddleware');

const sendError = (res, errors) =>
  res.status(400).json({ success: false, error: errors.array()[0].msg });

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const isDriver = (trip, userId) =>
  trip.driver.toString() === userId.toString();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  '/',
  protect,
  upload.single('carImage'),
  [
    body('from').trim().notEmpty().withMessage('From is required'),
    body('fromLat').isFloat().withMessage('FromLat must be a float'),
    body('fromLng').isFloat().withMessage('FromLng must be a float'),
    body('to').trim().notEmpty().withMessage('To is required'),
    body('date').isISO8601().toDate().withMessage('Valid date is required'),
    body('departureTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Invalid departure time format (HH:MM)'),
    body('distanceKm').isInt({ min: 1, max: 5000 }).withMessage('DistanceKm must be an integer between 1 and 5000'),
    body('estimatedDurationMinutes').isInt({ min: 1, max: 1440 }).withMessage('EstimatedDurationMinutes must be an integer between 1 and 1440'),
    body('cost').isFloat({ gt: 0, max: 1000 }).withMessage('Cost must be a positive float up to 1000'),
    body('availableSeats').isInt({ min: 1, max: 10 }).withMessage('AvailableSeats must be an integer between 1 and 10'),
    body('carModel').trim().notEmpty().withMessage('CarModel is required'),
    body('carColor').trim().notEmpty().withMessage('CarColor is required'),
    body('carLicensePlate').trim().notEmpty().withMessage('CarLicensePlate is required'),
    body('driverPreference').optional().isIn(['Any', 'Males Only', 'Females Only']).withMessage('Invalid driver preference'),
    body('passengerBagLimit').optional().isInt({ min: 0, max: 5 }).withMessage('PassengerBagLimit must be an integer between 0 and 5'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const {
        from,
        fromLat,
        fromLng,
        to,
        date,
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
        carImage = req.file.buffer;
        carImageType = req.file.mimetype;
      }

      if (new Date(date) < new Date(new Date().setHours(0, 0, 0, 0))) {
          return res.status(400).json({ success: false, errors: [{ msg: 'Trip date cannot be in the past' }] });
      }


      const trip = await Trip.create({
        driver: req.user._id,
        from,
        fromLat,
        fromLng,
        to,
        date,
        departureTime,
        distanceKm,
        estimatedDurationMinutes,
        cost,
        availableSeats: Number(availableSeats),
        carModel,
        carColor,
        carLicensePlate,
        driverPreference,
        passengerBagLimit: passengerBagLimit === '' ? 0 : Number(passengerBagLimit),
        carImage: carImage,
        carImageType: carImageType,
      });

      res.status(201).json({ success: true, data: trip });
    } catch (err) {
      console.error("Error creating trip:", err);
      if (err.code === 11000) {
           res.status(400).json({ success: false, error: 'Duplicate entry error.' });
      } else {
           res.status(500).json({ success: false, error: 'Server error creating trip' });
      }
    }
  }
);

router.get(
  '/',
  [
    query('status').optional().isIn(['active', 'full', 'completed', 'cancelled']).withMessage('Invalid status value'),
    query('minSeats').optional().isInt({ min: 1, max: 10 }).withMessage('MinSeats must be an integer between 1 and 10'),
    query('date').optional().isISO8601().toDate().withMessage('Invalid date format')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors);

    const { status, from, to, minSeats, date } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
         filter.status = status;
    } else {
        filter.status = 'active';
    }

    if (filter.status === 'active' && !date) {
        filter.date = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    } else if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        filter.date = { $gte: startOfDay, $lte: endOfDay };
    }


    if (from && from.trim().length >= 2) filter.from = new RegExp(from.trim(), 'i');
    if (to && to.trim().length >= 2) filter.to = new RegExp(to.trim(), 'i');
    if (minSeats) filter.availableSeats = { $gte: Number(minSeats) };

    try {
      const trips = await Trip.find(filter)
        .select('-passengers -carImage -carImageType')
        .populate('driver', 'firstName lastName averageRating')
        .sort({ date: 1, departureTime: 1 })
        .skip(skip)
        .limit(limit);

      res.json({
          success: true,
          count: trips.length,
          page,
          limit,
          data: trips,
        });
    } catch (err) {
      console.error("Error fetching trips:", err);
      res.status(500).json({ success: false, error: 'Server error fetching trips' });
    }
  }
);

router.post(
  '/:id/book',
  protect,
  [param('id').isMongoId().withMessage('Invalid Trip ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors);

    try {
      const trip = await Trip.findById(req.params.id);
      if (!trip) return res.status(404).json({ success: false, error: 'Trip not found', message: 'Trip not found' });

       if (new Date(trip.date) < new Date(new Date().setHours(0, 0, 0, 0))) {
           return res.status(400).json({ success: false, error: 'Cannot book a trip in the past', message: 'Cannot book a trip in the past' });
       }

      if (trip.status !== 'active') return res.status(400).json({ success: false, error: `Trip not bookable (status: ${trip.status})`, message: `Trip not bookable (status: ${trip.status})` });

      if (trip.driver.equals(req.user._id)) {
        return res.status(400).json({ success: false, error: 'Driver cannot book own trip', message: 'Driver cannot book own trip' });
      }

      if (trip.passengers.some(p => p.user && p.user.equals(req.user._id))) {
        return res.status(400).json({ success: false, error: 'Already booked', message: 'Already booked' });
      }

      if (trip.availableSeats < 1) {
        trip.status = 'full';
        await trip.save();
        return res.status(400).json({ success: false, error: 'No seats left', message: 'No seats left' });
      }

      trip.passengers.push({ user: req.user._id });
      trip.availableSeats -= 1;

      if (trip.availableSeats === 0) trip.status = 'full';

      await trip.save();

       const bookedTrip = await Trip.findById(trip._id)
                                     .select('-passengers.user -carImage -carImageType')
                                     .populate('driver', 'firstName lastName');

      res.json({ success: true, data: bookedTrip, message: 'Trip booked successfully' });
    } catch (err) {
      console.error("Error booking trip:", err);
      res.status(500).json({ success: false, error: 'Server error booking trip', message: 'Server error booking trip' });
    }
  }
);

router.get('/my-trips', protect, async (req, res) => {
  try {
    const trips = await Trip.find({ driver: req.user._id })
        .select('-carImage -carImageType')
        .populate('passengers.user', 'firstName lastName')
        .sort({ date: -1, departureTime: -1 });
    res.json({ success: true, data: trips });
  } catch (err) {
    console.error("Error fetching driver's trips:", err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/my-bookings', protect, async (req, res) => {
  try {
    const trips = await Trip.find({ 'passengers.user': req.user._id })
      .select('-carImage -carImageType')
      .populate('driver', 'firstName lastName averageRating')
      .sort({ date: -1, departureTime: -1 });
    res.json({ success: true, data: trips });
  } catch (err) {
    console.error("Error fetching passenger's bookings:", err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.patch('/:id/cancel', protect, [param('id').isMongoId().withMessage('Invalid Trip ID')], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors);

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (!isDriver(trip, req.user._id))
      return res.status(403).json({ success: false, message: 'Only driver can cancel this trip' });

    if (trip.status === 'cancelled' || trip.status === 'completed')
      return res.status(400).json({ success: false, message: `Trip already ${trip.status}` });

    trip.status = 'cancelled';
    await trip.save();

    res.json({ success: true, message: 'Trip cancelled successfully', data: trip });
}));

router.patch('/:id/complete', protect, [param('id').isMongoId().withMessage('Invalid Trip ID')], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors);

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!isDriver(trip, req.user._id))
      return res.status(403).json({ success: false, message: 'Only the driver can complete this trip' });

    if (trip.status !== 'active' && trip.status !== 'full')
      return res.status(400).json({ success: false, message: `Cannot complete a trip that is already ${trip.status}` });

     const now = new Date();
     const departureDateTime = new Date(`${trip.date.toISOString().split('T')[0]}T${trip.departureTime}`);
     if (departureDateTime > now) {
     }

    trip.status = 'completed';
    await trip.save();

    res.json({ success: true, message: 'Trip marked as completed', data: trip });
}));

router.patch('/:id/cancel-booking', protect, [param('id').isMongoId().withMessage('Invalid Trip ID')], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors);

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

     if (trip.status !== 'active' && trip.status !== 'full') {
         return res.status(400).json({ success: false, message: `Cannot cancel booking for a trip that is ${trip.status}` });
     }

    const passengerIndex = trip.passengers.findIndex(p => p.user && p.user.equals(req.user._id));
    if (passengerIndex === -1) return res.status(404).json({ success: false, message: 'You are not booked on this trip' });

    trip.passengers.splice(passengerIndex, 1);
    trip.availableSeats = Number(trip.availableSeats) + 1;

    if (trip.status === 'full' && trip.availableSeats > 0) {
        trip.status = 'active';
    }

    await trip.save();

    res.json({ success: true, message: 'Your booking has been cancelled', data: trip });
}));
/* ───────────────────────────────────────────────
   9) PASSENGER: RATE TRIP  – POST /api/trips/:id/rate
   ─────────────────────────────────────────────── */
   router.post(
    '/:id/rate',
    protect,
    [
      param('id').isMongoId(),
      body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
    ],
    asyncHandler(async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendError(res, errors);
  
      const trip = await Trip.findById(req.params.id);
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
  
      // هل المستخدم هو راكب فعلاً في الرحلة؟
      const isPassenger = trip.passengers.some(p => p.user.equals(req.user._id));
      if (!isPassenger) {
        return res.status(403).json({ message: 'You can only rate trips you booked' });
      }
  
      // نضيف التقييم
      trip.rating = req.body.rating;
      await trip.save();
  
      res.json({ success: true, message: 'Rating submitted successfully', data: trip });
    })
  );
/* ───────────────────────────────────────────────
   10) DRIVER: VIEW PASSENGERS FOR TRIP
   ─────────────────────────────────────────────── */
   router.get(
    '/:id/passengers',
    protect,
    [param('id').isMongoId().withMessage('Invalid Trip ID')],
    asyncHandler(async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendError(res, errors);
  
      const trip = await Trip.findById(req.params.id).populate('passengers.user', 'firstName lastName email');
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
  
      // هل المستخدم هو السائق؟
      if (!trip.driver.equals(req.user._id)) {
        return res.status(403).json({ message: 'Only the driver can view passengers' });
      }
  
      const passengers = trip.passengers.map(p => ({
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        email: p.user.email
      }));
  
      res.json({ success: true, passengers });
    })
  );
  

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid Trip ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors);

    try {
      const trip = await Trip.findById(req.params.id)
        .populate('driver', 'firstName lastName averageRating profileImage profileImageType phone')
        .populate('passengers.user', 'firstName lastName');

      if (!trip) return res.status(404).json({ success: false, error: 'Trip not found', message: 'Trip not found' });

      res.json({ success: true, data: trip });
    } catch (err) {
      console.error("Error fetching trip details:", err);
      res.status(500).json({ success: false, error: 'Server error fetching trip details', message: 'Server error fetching trip details' });
    }
  }
);


module.exports = router;