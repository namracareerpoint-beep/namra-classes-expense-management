const express = require('express');
const Wallet = require('../models/Wallet');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/wallets — Get wallet balances
router.get('/', auth, async (req, res) => {
  try {
    let wallet = await Wallet.findOne();
    if (!wallet) {
      wallet = await Wallet.create({ cash: 0, bank: 0, online: 0 });
    }
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/wallets/setup — Initial setup (admin only)
router.put('/setup', auth, adminOnly, async (req, res) => {
  try {
    const { cash, bank, online } = req.body;

    let wallet = await Wallet.findOne();
    if (!wallet) {
      wallet = new Wallet();
    }

    wallet.cash = Number(cash) || 0;
    wallet.bank = Number(bank) || 0;
    wallet.online = Number(online) || 0;
    wallet.isSetupComplete = true;
    await wallet.save();

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
