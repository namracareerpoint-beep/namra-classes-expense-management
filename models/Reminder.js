const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  recurring: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  wallet: {
    type: String,
    enum: ['cash', 'bank', 'online'],
    default: 'cash'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Index for querying upcoming/overdue reminders
reminderSchema.index({ dueDate: 1, isCompleted: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
