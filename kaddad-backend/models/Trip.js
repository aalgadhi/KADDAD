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
    type: String,
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
    type: String, // "Any", "Males Only", "Females Only"
    default: 'Any',
  },
  passengerBagLimit: {
    type: Number,
    default: 0,
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