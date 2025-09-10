const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  smartAccountAddress: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otpCode: {
    type: String
  },
  otpExpiry: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);