const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Signup
router.post('/signup',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authController.signup
);

// Login
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

// Forgot password
router.post('/forgot-password',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  authController.forgotPassword
);

// Verify code
router.post('/verify-code',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  ],
  authController.verifyCode
);

// Resend code
router.post('/resend-code',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  authController.resendCode
);

// Reset password
router.post('/reset-password',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authController.resetPassword
);

// Logout
router.post('/logout', authController.logout);

// Get current user
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;