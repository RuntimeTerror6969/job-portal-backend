const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { verifyToken , verifyAdmin } = require('../middleware/Auth');
const Ticket = require('../models/ticket')


router.get('/view-profile', verifyToken, async (req, res) => {

    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } 
    catch (err) {
        res.status(500).send('Server error');
    }
});


router.put('/update-profile', verifyToken, async (req, res) => {
    const { name, email , phone , skills } = req.body;

    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (skills) user.skills = skills;

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
});


// Change user password
router.put('/change-password', verifyToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

       
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});


router.post("/tickets", verifyToken, async (req, res) => {
    const { name, email, phone, topic, feedback } = req.body;
  
    try {
      const ticket = new Ticket({
        name,
        email,
        phone,
        topic,
        feedback,
        userId: req.user._id, // Link ticket to authenticated user
      });
      await ticket.save();
      res.status(201).json({ message: "Ticket saved successfully" });
    } catch (error) {
      console.error("Error saving ticket:", error);
      res.status(500).json({ msg: "Failed to save ticket" });
    }
  });
  
  // GET route for admins to view tickets
  router.get("/tickets", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const tickets = await Ticket.find().sort({ createdAt: -1 }); // Newest first
      res.status(200).json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  });

module.exports = router;
