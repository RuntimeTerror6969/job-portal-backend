const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); 
const { verifyToken, verifyAdmin } = require('../middleware/Auth'); 


// Route to create a new category(only adminss can acesss)..

router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ msg: 'Name is required' });
    }

    // Create and save the new category
    const newCategory = new Category({ name });
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (err) {
    console.error();   
    res.status(500).send(err.message);
  }
});

// view categories(for anyone)..

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
