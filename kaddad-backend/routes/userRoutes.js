const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Assuming your protect middleware is actually named protect.js
// If it's authMiddleware.js, keep that name. Adjust path if needed.
const protect = require('../middleware/protect'); // Corrected path/name assumption

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, phone, email, password, address } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,
            address
            // isAdmin and isBanned will use defaults from the schema
        });

        await newUser.save();

        // Don't send back sensitive info like password hash even if excluded later
        // Just send confirmation and basic info
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                 _id: newUser._id, // Send ID if needed by frontend
                 firstName: newUser.firstName,
                 email: newUser.email,
                 isAdmin: newUser.isAdmin // Send initial admin status
            }
         });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        // Use 401 Unauthorized for bad credentials instead of 400 Bad Request
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare submitted password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // ***** ADDED CHECK FOR isBanned *****
        if (user.isBanned) {
            // Use 403 Forbidden status code for banned users
            return res.status(403).json({ message: "Access denied: Account is banned." });
        }
        // **************************************

        // If credentials are valid and user is not banned, proceed to create JWT
        const payload = {
            user: {
                userId: user._id
                // No need to include isAdmin in JWT payload if protect middleware fetches the user anyway
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }, // Changed expiry to 1 day for example
            (err, token) => {
                if (err) {
                    console.error("JWT Signing Error:", err);
                    // Throwing error here might crash server if not caught, better to send response
                    return res.status(500).json({ message: "Error signing token" });
                };

                // Send necessary info, avoid sending the whole user object if possible
                res.json({
                    message: "Login successful",
                    token: token,
                    isAdmin: user.isAdmin, // Critical for frontend routing
                    user: { // Send only necessary, non-sensitive user details
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                        // Consider if other fields like phone/address are needed immediately after login
                    }
                });
            }
        );
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get user profile
router.get('/profile', protect, async (req, res) => {
    try {
        // req.user should be attached by the protect middleware
        // It already excludes the password based on the protect middleware logic
        if (req.user) {
            res.json(req.user);
        } else {
            // This case might not be reachable if protect middleware handles user not found
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});


// Update user profile
router.put('/profile', protect, async (req, res) => {
    try {
        // Find user by the ID attached from the protect middleware
        const user = await User.findById(req.user._id); // Use _id from req.user

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;

            // Only update email if provided and different (consider uniqueness validation)
            if (req.body.email && req.body.email !== user.email) {
                 // Optional: Check if the new email is already taken by another user
                 const emailExists = await User.findOne({ email: req.body.email, _id: { $ne: user._id } });
                 if (emailExists) {
                     return res.status(400).json({ message: 'Email already in use' });
                 }
                user.email = req.body.email;
            }

            // Update password only if a new one is provided
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            // Respond with updated user info (excluding password)
            res.json({
                message: "Profile updated successfully",
                user: {
                    _id: updatedUser._id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                    isAdmin: updatedUser.isAdmin // Keep sending isAdmin status
                }
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Update Profile Error:", error);
        if (error.code === 11000) { // Handle potential duplicate email error on save
             return res.status(400).json({ message: 'Email already in use' });
        }
        res.status(500).json({ message: "Server error updating profile" });
    }
});


module.exports = router;