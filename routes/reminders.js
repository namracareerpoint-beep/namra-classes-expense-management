const express = require('express');
const Reminder = require('../models/Reminder');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/reminders — List all reminders
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find()
      .populate('createdBy', 'name username')
      .sort({ dueDate: 1 });

    // Add status to each reminder
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const enriched = reminders.map(r => {
      const rem = r.toObject();
      const due = new Date(rem.dueDate);
      due.setHours(0, 0, 0, 0);

      if (rem.isCompleted) {
        rem.status = 'completed';
      } else if (due < now) {
        rem.status = 'overdue';
      } else if (due.getTime() === now.getTime()) {
        rem.status = 'due_today';
      } else {
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        rem.status = diffDays <= 3 ? 'upcoming' : 'scheduled';
        rem.daysUntilDue = diffDays;
      }
      return rem;
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/reminders — Create reminder
router.post('/', auth, async (req, res) => {
  try {
    const { name, amount, dueDate, recurring, frequency, wallet } = req.body;

    if (!name || !dueDate) {
      return res.status(400).json({ error: 'Name and due date are required.' });
    }

    const reminder = await Reminder.create({
      name,
      amount: Number(amount) || 0,
      dueDate: new Date(dueDate),
      recurring: recurring || false,
      frequency: frequency || 'monthly',
      wallet: wallet || 'cash',
      createdBy: req.user._id
    });

    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/reminders/:id/complete — Mark reminder as completed
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found.' });
    }

    if (reminder.recurring) {
      // For recurring, move due date forward
      const nextDue = new Date(reminder.dueDate);
      if (reminder.frequency === 'weekly') {
        nextDue.setDate(nextDue.getDate() + 7);
      } else if (reminder.frequency === 'monthly') {
        nextDue.setMonth(nextDue.getMonth() + 1);
      } else if (reminder.frequency === 'yearly') {
        nextDue.setFullYear(nextDue.getFullYear() + 1);
      }
      reminder.dueDate = nextDue;
      reminder.isCompleted = false;
    } else {
      reminder.isCompleted = true;
      reminder.completedDate = new Date();
    }

    await reminder.save();
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/reminders/:id — Delete reminder (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found.' });
    }
    res.json({ message: 'Reminder deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
