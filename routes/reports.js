const express = require('express');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/summary', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = Number(month) || new Date().getMonth() + 1;
    const y = Number(year) || new Date().getFullYear();
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);
    const transactions = await Transaction.find({ date: { $gte: startDate, $lte: endDate } });
    let totalExpense = 0, totalDeposit = 0, totalTransfer = 0;
    const walletBreakdown = { cash: { expense: 0, deposit: 0 }, bank: { expense: 0, deposit: 0 }, online: { expense: 0, deposit: 0 } };
    transactions.forEach(t => {
      if (t.type === 'expense') { totalExpense += t.amount; walletBreakdown[t.wallet].expense += t.amount; }
      else if (t.type === 'deposit') { totalDeposit += t.amount; walletBreakdown[t.wallet].deposit += t.amount; }
      else if (t.type === 'transfer') { totalTransfer += t.amount; }
    });
    res.json({ month: m, year: y, totalExpense, totalDeposit, totalTransfer, net: totalDeposit - totalExpense, transactionCount: transactions.length, walletBreakdown });
  } catch (error) { res.status(500).json({ error: 'Server error.' }); }
});

router.get('/category-wise', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = Number(month) || new Date().getMonth() + 1;
    const y = Number(year) || new Date().getFullYear();
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);
    const result = await Transaction.aggregate([
      { $match: { type: 'expense', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Server error.' }); }
});

router.get('/daily', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = Number(month) || new Date().getMonth() + 1;
    const y = Number(year) || new Date().getFullYear();
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);
    const result = await Transaction.aggregate([
      { $match: { type: { $in: ['expense', 'deposit'] }, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { day: { $dayOfMonth: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
      { $sort: { '_id.day': 1 } }
    ]);
    const daysInMonth = new Date(y, m, 0).getDate();
    const daily = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const exp = result.find(r => r._id.day === d && r._id.type === 'expense');
      const dep = result.find(r => r._id.day === d && r._id.type === 'deposit');
      daily.push({ day: d, expense: exp ? exp.total : 0, deposit: dep ? dep.total : 0 });
    }
    res.json(daily);
  } catch (error) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
