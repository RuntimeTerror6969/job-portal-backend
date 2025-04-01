const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/signup', async (req, res) => {
    
    const { name ,email, password, role } = req.body;

  
    try {
        let user = await User.findOne({ email });
        console.log('User found:', user);
        if (user) {
            return res.status(400).json({ msg: 'Email already exists' });
        }

        user = new User({
            name,
            email,
            password,
            role,
        });

        console.log('New user created:', user);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '10d' },
            (err, token) => {
                if (err) {
                    console.error('JWT Error:', err); 
                    throw err;
                }
                console.log('JWT generated:', token);
                res.json({ token, user });
            }
        );
    } catch (err) {
        console.error('Signup Error:', err.message); 
        res.status(500).send('Server error');
    }
});


router.post('/login', async (req, res) => {
    try {
        console.time('loginProcess');

        // Your login logic

        const { email, password } = req.body;
  
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User does not exist' });
        }
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Incorrect Password' });
        }
  
        const payload = {
            user: {
                id: user.id,
            },
        };
  
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '10d' },
            (err, token) => {
                if (err) {
                    console.error('JWT Error:', err); 
                    throw err;
                }
                res.status(200).json({
                    token,
                    id: user._id,
                    role: user.role,
                    msg: 'Login Successful'
                });
            }
        );
    } catch (err) {
        console.error('Login Error:', err.message); 
        res.status(500).send('Server error');
    }
        console.timeEnd('loginProcess');
    } 
    catch (error) {
        console.error('Detailed Login Error:', error);
    }
    // const { email, password } = req.body;
  
    // try {
    //     let user = await User.findOne({ email });
    //     if (!user) {
    //         return res.status(400).json({ msg: 'User does not exist' });
    //     }
  
    //     const isMatch = await bcrypt.compare(password, user.password);
    //     if (!isMatch) {
    //         return res.status(401).json({ msg: 'Incorrect Password' });
    //     }
  
    //     const payload = {
    //         user: {
    //             id: user.id,
    //         },
    //     };
  
    //     jwt.sign(
    //         payload,
    //         process.env.JWT_SECRET,
    //         { expiresIn: '10d' },
    //         (err, token) => {
    //             if (err) {
    //                 console.error('JWT Error:', err); 
    //                 throw err;
    //             }
    //             res.status(200).json({
    //                 token,
    //                 id: user._id,
    //                 role: user.role,
    //                 msg: 'Login Successful'
    //             });
    //         }
    //     );
    // } catch (err) {
    //     console.error('Login Error:', err.message); 
    //     res.status(500).send('Server error');
    // }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset URL - ensure proper URL formatting
    const baseUrl = process.env.FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash if present
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>You requested a password reset</h1>
        <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>
        <p>This link will expire in 10 minutes</p>
        <p>If you didn't request this, please ignore this email</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ msg: 'Password reset email sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Error sending reset email' });
  }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ msg: 'Password has been reset' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Error resetting password' });
  }
});

module.exports = router;
