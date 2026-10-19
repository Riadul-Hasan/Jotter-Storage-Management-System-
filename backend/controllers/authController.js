const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');

// Create nodemailer transporter
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} catch (error) {
  console.error('🔥 Failed to create transporter:', error.message);
}

// Generate 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup
exports.signup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: errors.array()[0]?.msg || 'Validation failed',
      errors: errors.array() 
    });
  }

  const { username, email, password } = req.body;

  // Check if email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email already registered' 
    });
  }

  // Check if username already exists
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username already taken' 
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

  try {
    await user.save();
  } catch (saveError) {
    // Handle duplicate key errors (E11000)
    if (saveError.code === 11000) {
      const field = Object.keys(saveError.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: field === 'username' ? 'Username already taken' : 'Email already registered'
      });
    }
    throw saveError;
  }

  // Attempt to send welcome email (Optional - won't block signup)
  if (transporter) {
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Jotter!',
      text: `Hi ${username}, welcome to your secure storage sanctuary.`
    }).catch(err => console.error('📧 Welcome email failed (non-critical):', err.message));
  }

  res.status(201).json({ 
    success: true, 
    message: 'Account created successfully. Please login.' 
  });
});

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

    console.log("Login attempt:", email);

    // Find user
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password safely
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error("Bcrypt error:", bcryptError);
      return res.status(500).json({
        success: false,
        message: "Password comparison failed"
      });
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Save session safely
    if (!req.session) {
      return res.status(500).json({
        success: false,
        message: "Session not initialized"
      });
    }

    req.session.userId = user._id;

    return res.json({
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
    console.error('🔥 LOGIN CRASH:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};
// Forgot Password — emails a 6-digit code.
// `purpose` is 'account' (login password) or 'vault' (private-vault password).
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const purpose = req.body.purpose === 'vault' ? 'vault' : 'account';

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // A vault reset only makes sense once a vault password exists
    if (purpose === 'vault' && !user.hasLockPassword) {
      return res.status(400).json({
        success: false,
        message: 'No vault password has been set for this account yet'
      });
    }

    // Generate code
    const code = generateCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save code to user
    user.resetCode = code;
    user.resetCodeExpiry = expiry;
    user.resetPurpose = purpose;
    await user.save();

    const isVault = purpose === 'vault';

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: isVault
          ? 'Jotter - Vault Password Reset Code'
          : 'Jotter - Password Reset Code',
        html: `
          <h2>${isVault ? 'Vault Password Reset' : 'Password Reset'}</h2>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Surface the failure instead of pretending the email was sent
      return res.status(500).json({
        success: false,
        message: 'Could not send the reset email. Please try again later.'
      });
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

// Reset Password — replaces either the account or vault password,
// depending on which reset was requested (user.resetPurpose).
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

    const isVault = user.resetPurpose === 'vault';

    // Hash new password and replace the right credential
    const hashedPassword = await bcrypt.hash(password, 10);
    if (isVault) {
      user.lockPassword = hashedPassword;
      user.hasLockPassword = true;
    } else {
      user.password = hashedPassword;
    }
    user.resetCode = null;
    user.resetCodeExpiry = null;
    user.resetPurpose = null;
    await user.save();

    res.json({
      success: true,
      message: isVault
        ? 'Vault password reset successful. You can now open your private vault.'
        : 'Password reset successful. Please login.',
      purpose: isVault ? 'vault' : 'account'
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
    const user = await User.findById(req.session.userId).select('-password -lockPassword -resetCode -resetCodeExpiry -resetPurpose');
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