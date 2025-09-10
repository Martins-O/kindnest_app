const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpEmail } = require('../utils/email');
const { generateSmartAccountAddress, generateOTP } = require('../utils/crypto');

const router = express.Router();

// In-memory storage for demo/fallback when database is unavailable
const memoryStorage = new Map();

// Send OTP to email
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('📧 Send OTP request received for:', email);
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    // Generate OTP and smart account address
    const otp = generateOTP();
    const smartAccountAddress = generateSmartAccountAddress(email);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update or create user with timeout protection
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      );
      
      const dbOperation = User.findOneAndUpdate(
        { email },
        { 
          email,
          smartAccountAddress,
          otpCode: otp,
          otpExpiry,
          isVerified: false
        },
        { upsert: true, new: true }
      );

      await Promise.race([dbOperation, timeoutPromise]);
      console.log('✅ User saved to database');
    } catch (dbError) {
      console.error('💾 Database error, using memory fallback:', dbError.message);
      
      memoryStorage.set(email, {
        email,
        smartAccountAddress,
        otpCode: otp,
        otpExpiry,
        isVerified: false,
        createdAt: Date.now()
      });
    }

    // Send OTP email
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send email' });
    }

    console.log('✅ OTP process completed for:', email);
    res.json({ 
      success: true, 
      message: 'OTP sent to your email',
      smartAccountAddress // Return the address for preview
    });

  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    console.log('🔍 Verify OTP request received for:', email);
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }

    let user = null;
    let usingMemoryStorage = false;

    // Try to find user in database first
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      );
      
      const dbQuery = User.findOne({
        email,
        otpCode: otp,
        otpExpiry: { $gt: new Date() }
      });

      user = await Promise.race([dbQuery, timeoutPromise]);
    } catch (dbError) {
      console.error('💾 Database error, checking memory storage:', dbError.message);
      
      // Check memory storage
      const memoryUser = memoryStorage.get(email);
      if (memoryUser && memoryUser.otpCode === otp && new Date(memoryUser.otpExpiry) > new Date()) {
        user = memoryUser;
        usingMemoryStorage = true;
      }
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark user as verified and clear OTP
    if (usingMemoryStorage) {
      user.isVerified = true;
      user.otpCode = undefined;
      user.otpExpiry = undefined;
      memoryStorage.set(email, user);
      console.log('✅ User verified in memory storage');
    } else {
      user.isVerified = true;
      user.otpCode = undefined;
      user.otpExpiry = undefined;
      try {
        await user.save();
        console.log('✅ User verified in database');
      } catch (saveError) {
        console.error('💾 Failed to save to database:', saveError.message);
        // Continue anyway since we have the user data
      }
    }

    // Generate JWT token
    const userId = usingMemoryStorage ? user.email : user._id;
    const token = jwt.sign(
      { 
        userId, 
        email: user.email,
        smartAccountAddress: user.smartAccountAddress
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ JWT token generated successfully');

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        email: user.email,
        smartAccountAddress: user.smartAccountAddress,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint for existing users (creates JWT token)
router.post('/login', async (req, res) => {
  try {
    const { email, smartAccountAddress } = req.body;
    
    console.log('🔐 Login request received for:', email);
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    let user = null;
    let usingMemoryStorage = false;

    // Try database first
    try {
      user = await User.findOne({ email });
      console.log('📊 Database user found:', !!user);
    } catch (dbError) {
      console.warn('Database unavailable for login, checking memory storage');
      user = memoryStorage.get(email);
      usingMemoryStorage = true;
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate JWT token
    const userId = usingMemoryStorage ? user.email : user._id;
    const token = jwt.sign(
      { 
        userId, 
        email: user.email,
        smartAccountAddress: user.smartAccountAddress
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login JWT token generated successfully');

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        email: user.email,
        smartAccountAddress: user.smartAccountAddress,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('🔍 Received token:', token.substring(0, 50) + '...');
    console.log('🔍 Token length:', token.length);
    console.log('🔍 JWT_SECRET configured:', !!process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 Profile request - decoded token:', { userId: decoded.userId, email: decoded.email });
    let user = null;

    // Try database first (when userId is ObjectId)
    try {
      if (decoded.userId && decoded.userId.length === 24) { // MongoDB ObjectId length
        console.log('🔍 Trying database lookup for ObjectId:', decoded.userId);
        user = await User.findById(decoded.userId);
        console.log('🔍 Database user found:', !!user);
      } else {
        console.log('🔍 UserId is not ObjectId format, skipping database lookup');
      }
    } catch (dbError) {
      console.log('🔍 Database lookup failed, checking memory storage:', dbError.message);
    }

    // If no user found in database, check memory storage (when userId is email)
    if (!user && decoded.email) {
      console.log('🔍 Checking memory storage for email:', decoded.email);
      const memoryUser = memoryStorage.get(decoded.email);
      console.log('🔍 Memory user found:', !!memoryUser, 'verified:', memoryUser?.isVerified);
      if (memoryUser && memoryUser.isVerified) {
        user = memoryUser;
      }
    }

    if (!user || !user.isVerified) {
      console.log('🔍 User validation failed:', { hasUser: !!user, isVerified: user?.isVerified });
      return res.status(401).json({ error: 'Invalid user' });
    }

    console.log('✅ Profile response successful for:', user.email);
    res.json({
      user: {
        id: user._id || decoded.userId,
        email: user.email,
        smartAccountAddress: user.smartAccountAddress,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // With JWT, logout is handled client-side by removing token
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;