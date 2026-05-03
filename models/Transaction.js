const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['expense', 'deposit', 'transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  wallet: {
    type: String,
    enum: ['cash', 'bank', 'online'],
    required: true
  },
  toWallet: {
    type: String,
    enum: ['cash', 'bank', 'online'],
    default: null
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'Other'
  },
  date: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Index for efficient querying
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ wallet: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
