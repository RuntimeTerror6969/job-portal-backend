const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { verifyToken } = require('../middleware/Auth');



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
    const { name, email } = req.body;

    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;

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

module.exports = router;
