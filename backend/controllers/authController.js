const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup
exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { username, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ 
      success: true, 
      message: 'Account created successfully. Please login.' 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during signup' 
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Set session
    req.session.userId = user._id;

    res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email' 
      });
    }

    // Generate code
    const code = generateCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save code to user
    user.resetCode = code;
    user.resetCodeExpiry = expiry;
    await user.save();

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Jotter - Password Reset Code',
        html: `
          <h2>Password Reset Code</h2>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Continue anyway for development
    }

    res.json({ 
      success: true, 
      message: 'Verification code sent to your email',
      email: email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Verify Code
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.resetCode || !user.resetCodeExpiry) {
      return res.status(400).json({ 
        success: false, 
        message: 'No reset code found. Please request a new one.' 
      });
    }

    if (user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code has expired. Please request a new one.' 
      });
    }

    if (user.resetCode !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid code' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Code verified successfully' 
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Resend Code
exports.resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate new code
    const code = generateCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetCode = code;
    user.resetCodeExpiry = expiry;
    await user.save();

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Jotter - New Password Reset Code',
        html: `
          <h2>Password Reset Code</h2>
          <p>Your new verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    res.json({ 
      success: true, 
      message: 'New code sent to your email' 
    });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.resetCode !== code || user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired code' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password reset successful. Please login.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Logout failed' 
      });
    }
    res.clearCookie('connect.sid');
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password -resetCode -resetCodeExpiry');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};