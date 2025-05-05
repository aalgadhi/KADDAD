// models/Trip.js
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  from: {
    type: String,
    required: true,
    trim: true,
  },
  fromLat: {
    type: Number,
    required: true,
  },
  fromLng: {
    type: Number,
    required: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  departureTime: {
    type: String, // "HH:MM"
    required: true,
  },
  distanceKm: {
    type: Number,
    required: true,
  },
  estimatedDurationMinutes: {
    type: Number,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
  carModel: {
    type: String,
    required: true,
  },
  carColor: {
    type: String,
    required: true,
  },
  carLicensePlate: {
    type: String,
    required: true,
  },
  driverPreference: {
    type: String,
    default: 'Any',
  },
  passengerBagLimit: {
    type: Number,
    default: 0,
  },
  carImage: {
    type: Buffer,
    required: false
  },
  carImageType: {
    type: String,
    required: false
  },
  passengers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }
  ],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'full'],
    default: 'active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Trip', tripSchema);