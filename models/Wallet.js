const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  cash: {
    type: Number,
    default: 0,
    min: 0
  },
  bank: {
    type: Number,
    default: 0,
    min: 0
  },
  online: {
    type: Number,
    default: 0,
    min: 0
  },
  isSetupComplete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Virtual for total balance
walletSchema.virtual('total').get(function () {
  return this.cash + this.bank + this.online;
});

// Ensure virtuals are included in JSON
walletSchema.set('toJSON', { virtuals: true });
walletSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Wallet', walletSchema);
