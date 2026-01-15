const User = require("../models/User");
const Item = require("../models/Item");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).select(
      "-password -resetCode -resetCodeExpiry"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { username } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (username) {
      user.username = username;
    }

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if exists
      if (user.avatar) {
        const oldAvatarPath = path.join(__dirname, "..", user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { password } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Delete all user items and files
    const items = await Item.find({ userId });
    for (const item of items) {
      if (item.filePath) {
        const filePath = path.join(__dirname, "..", item.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    await Item.deleteMany({ userId });

    // Delete avatar if exists
    if (user.avatar) {
      const avatarPath = path.join(__dirname, "..", user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Delete user
    await User.deleteOne({ _id: userId });

    // Destroy session
    req.session.destroy();

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Set lock password
exports.setLockPassword = async (req, res) => {
  try {
    const { lockPassword } = req.body;
    const hashedPassword = await bcrypt.hash(lockPassword, 10);

    await User.findByIdAndUpdate(req.session.userId, {
      lockPassword: hashedPassword,
      hasLockPassword: true,
    });

    res.json({ success: true, message: "Lock password set" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Verify lock password
exports.verifyLockPassword = async (req, res) => {
  try {
    const { lockPassword } = req.body;
    const user = await User.findById(req.session.userId);

    const isValid = await bcrypt.compare(lockPassword, user.lockPassword);

    if (isValid) {
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
