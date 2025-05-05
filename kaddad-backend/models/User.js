const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  paymentMethods: [{
    type: {
      type: String
    },
    last4: {
      type: String
    },
    expires: {
      type: String
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;