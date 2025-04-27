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
  to: {
    type: String,
    required: true,
    trim: true,
  },
  departureTime: {
    type: String, // Example: "10:30"
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
  availableSeats: {      // 👈 ADD THIS FIELD!
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

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;