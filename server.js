require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');
const Wallet = require('./models/Wallet');
const Category = require('./models/Category');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallets', require('./routes/wallets'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/reports', require('./routes/reports'));

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Seed defaults
async function seedDefaults() {
  try {
    // Seed admin user
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({ username: 'admin', password: 'admin123', name: 'Admin', role: 'admin' });
      console.log('🔑 Default admin created (admin / admin123)');
    }
    // Seed wallet
    const walletExists = await Wallet.findOne();
    if (!walletExists) {
      await Wallet.create({ cash: 0, bank: 0, online: 0, isSetupComplete: false });
      console.log('💰 Default wallet created');
    }
    // Seed categories
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      const defaults = [
        { name: 'Rent', icon: '🏠', isDefault: true },
        { name: 'Staff Salary', icon: '👨‍🏫', isDefault: true },
        { name: 'Supplies & Stationery', icon: '📝', isDefault: true },
        { name: 'Electricity', icon: '⚡', isDefault: true },
        { name: 'Internet & Phone', icon: '📱', isDefault: true },
        { name: 'Maintenance & Repairs', icon: '🔧', isDefault: true },
        { name: 'Fees Collection', icon: '💰', isDefault: true },
        { name: 'Marketing', icon: '📢', isDefault: true },
        { name: 'Transport', icon: '🚗', isDefault: true },
        { name: 'Transfer', icon: '🔄', isDefault: true },
        { name: 'Other', icon: '📁', isDefault: true }
      ];
      await Category.insertMany(defaults);
      console.log('📂 Default categories seeded');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

// Start server
connectDB().then(() => {
  seedDefaults().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
});
