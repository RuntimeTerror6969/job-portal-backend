const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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

module.exports = router;
