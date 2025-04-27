const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router  = express.Router();

const Trip   = require('../models/Trip');
const protect = require('../middlewares/authMiddleware');

/* helper */
const sendError = (res, errors) =>
  res.status(400).json({ success:false, error: errors.array()[0].msg });

/* ───────────────────────────────────────────────
   1) CREATE TRIP  – POST /api/trips  (driver)
   ─────────────────────────────────────────────── */
router.post(
  '/',
  protect,
  [
    body('from').trim().notEmpty(),
    body('to').trim().notEmpty(),
    body('departureTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/),
    body('distanceKm').isInt({ min:1,max:1000 }),
    body('estimatedDurationMinutes').isInt({ min:1,max:600 }),
    body('cost').isFloat({ gt:0 }),
    body('availableSeats').isInt({ min:1,max:10 }),
    body('driverPreference').optional()
      .isIn(['Any','Males Only','Females Only']),
    body('passengerBagLimit').optional().isInt({ min:0,max:5 })
  ],
  async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return sendError(res, errors);

    try{
      const trip = await Trip.create({ driver:req.user._id, ...req.body });
      res.status(201).json({ success:true, data:trip });
    }catch(err){
      console.error(err);
      res.status(500).json({ success:false, error:'Server error' });
    }
});

/* ───────────────────────────────────────────────
   2) PUBLIC LIST  – GET /api/trips
   ─────────────────────────────────────────────── */
router.get(
  '/',
  [
    query('status').optional().isIn(['active','full','completed','cancelled']),
    query('minSeats').optional().isInt({ min:1,max:10 })
  ],
  async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return sendError(res, errors);

    const { status='active', from, to, minSeats } = req.query;
    const filter = { status };

    if(from) filter.from = new RegExp(from,'i');
    if(to)   filter.to   = new RegExp(to,'i');
    if(minSeats) filter.availableSeats = { $gte:+minSeats };

    const trips = await Trip.find(filter)
      .select('-passengers')
      .populate('driver','firstName lastName');

    res.json({ success:true, data:trips });
});

/* ───────────────────────────────────────────────
   3) BOOK TRIP – POST /api/trips/:id/book
   ─────────────────────────────────────────────── */
router.post(
  '/:id/book',
  protect,
  [ param('id').isMongoId() ],
  async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return sendError(res, errors);

    const trip = await Trip.findById(req.params.id);
    if(!trip)  return res.status(404).json({ success:false,error:'Trip not found' });
    if(trip.status!=='active') return res.status(400).json({ success:false,error:'Trip not bookable' });
    if(trip.passengers.find(p => p.user.equals(req.user._id)))
         return res.status(400).json({ success:false,error:'Already booked' });
    if(trip.availableSeats<1)
         return res.status(400).json({ success:false,error:'No seats left' });

    trip.passengers.push({ user:req.user._id });
    trip.availableSeats -= 1;
    if(trip.availableSeats===0) trip.status='full';
    await trip.save();
    res.json({ success:true, data:trip });
});

/* ───────────────────────────────────────────────
   4) DRIVER: MY CREATED TRIPS  – GET /api/trips/my-trips
   ─────────────────────────────────────────────── */
router.get('/my-trips', protect, async (req,res)=>{
  const trips = await Trip.find({ driver:req.user._id });
  res.json({ success:true, data:trips });
});

/* ───────────────────────────────────────────────
   5) PASSENGER: MY BOOKINGS – GET /api/trips/my-bookings
   ─────────────────────────────────────────────── */
router.get('/my-bookings', protect, async (req,res)=>{
  const trips = await Trip.find({ 'passengers.user':req.user._id })
        .populate('driver','firstName lastName');
  res.json({ success:true, data:trips });
});

module.exports = router;