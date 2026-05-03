const express = require('express');
const Category = require('../models/Category');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories — List all categories
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ isDefault: -1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/categories — Create custom category (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists.' });
    }

    const category = await Category.create({
      name,
      icon: icon || '📁',
      isDefault: false
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/categories/:id — Delete custom category (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    if (category.isDefault) {
      return res.status(400).json({ error: 'Cannot delete default categories.' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
