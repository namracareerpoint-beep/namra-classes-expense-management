const express = require('express');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/transactions/expense — Add expense
router.post('/expense', auth, async (req, res) => {
  try {
    const { amount, wallet, description, category, date } = req.body;

    if (!amount || !wallet || !description) {
      return res.status(400).json({ error: 'Amount, wallet, and description are required.' });
    }

    const numAmount = Number(amount);
    if (numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }

    // Check sufficient balance
    const walletDoc = await Wallet.findOne();
    if (!walletDoc) {
      return res.status(400).json({ error: 'Wallet not set up yet.' });
    }

    if (walletDoc[wallet] < numAmount) {
      return res.status(400).json({ error: `Insufficient ${wallet} balance. Available: ₹${walletDoc[wallet]}` });
    }

    // Deduct from wallet
    walletDoc[wallet] -= numAmount;
    await walletDoc.save();

    // Create transaction
    const transaction = await Transaction.create({
      type: 'expense',
      amount: numAmount,
      wallet,
      description,
      category: category || 'Other',
      date: date ? new Date(date) : new Date(),
      createdBy: req.user._id
    });

    await transaction.populate('createdBy', 'name username');

    res.status(201).json({ transaction, walletBalances: walletDoc });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/transactions/deposit — Add deposit
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, wallet, description, category, date } = req.body;

    if (!amount || !wallet || !description) {
      return res.status(400).json({ error: 'Amount, wallet, and description are required.' });
    }

    const numAmount = Number(amount);
    if (numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }

    // Add to wallet
    const walletDoc = await Wallet.findOne();
    if (!walletDoc) {
      return res.status(400).json({ error: 'Wallet not set up yet.' });
    }

    walletDoc[wallet] += numAmount;
    await walletDoc.save();

    // Create transaction
    const transaction = await Transaction.create({
      type: 'deposit',
      amount: numAmount,
      wallet,
      description,
      category: category || 'Fees Collection',
      date: date ? new Date(date) : new Date(),
      createdBy: req.user._id
    });

    await transaction.populate('createdBy', 'name username');

    res.status(201).json({ transaction, walletBalances: walletDoc });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/transactions/transfer — Transfer between wallets
router.post('/transfer', auth, async (req, res) => {
  try {
    const { amount, wallet, toWallet, description, date } = req.body;

    if (!amount || !wallet || !toWallet) {
      return res.status(400).json({ error: 'Amount, source wallet, and destination wallet are required.' });
    }

    if (wallet === toWallet) {
      return res.status(400).json({ error: 'Source and destination wallet cannot be the same.' });
    }

    const numAmount = Number(amount);
    if (numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }

    // Check sufficient balance
    const walletDoc = await Wallet.findOne();
    if (!walletDoc) {
      return res.status(400).json({ error: 'Wallet not set up yet.' });
    }

    if (walletDoc[wallet] < numAmount) {
      return res.status(400).json({ error: `Insufficient ${wallet} balance. Available: ₹${walletDoc[wallet]}` });
    }

    // Transfer
    walletDoc[wallet] -= numAmount;
    walletDoc[toWallet] += numAmount;
    await walletDoc.save();

    // Create transaction
    const walletLabels = { cash: 'Cash', bank: 'Bank', online: 'Online' };
    const transaction = await Transaction.create({
      type: 'transfer',
      amount: numAmount,
      wallet,
      toWallet,
      description: description || `Transfer from ${walletLabels[wallet]} to ${walletLabels[toWallet]}`,
      category: 'Transfer',
      date: date ? new Date(date) : new Date(),
      createdBy: req.user._id
    });

    await transaction.populate('createdBy', 'name username');

    res.status(201).json({ transaction, walletBalances: walletDoc });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/transactions — List transactions with filters
router.get('/', auth, async (req, res) => {
  try {
    const { type, wallet, startDate, endDate, search, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (wallet) filter.wallet = wallet;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('createdBy', 'name username')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(filter)
    ]);

    res.json({
      transactions,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/transactions/:id — Delete transaction & reverse wallet change (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const walletDoc = await Wallet.findOne();

    // Reverse the wallet change
    if (transaction.type === 'expense') {
      walletDoc[transaction.wallet] += transaction.amount;
    } else if (transaction.type === 'deposit') {
      walletDoc[transaction.wallet] -= transaction.amount;
      if (walletDoc[transaction.wallet] < 0) walletDoc[transaction.wallet] = 0;
    } else if (transaction.type === 'transfer') {
      walletDoc[transaction.wallet] += transaction.amount;
      walletDoc[transaction.toWallet] -= transaction.amount;
      if (walletDoc[transaction.toWallet] < 0) walletDoc[transaction.toWallet] = 0;
    }

    await walletDoc.save();
    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ message: 'Transaction deleted and wallet updated.', walletBalances: walletDoc });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
