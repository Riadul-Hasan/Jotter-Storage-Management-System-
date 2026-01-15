const Item = require('../models/Item');
const bcrypt = require('bcrypt');

// Lock folder with password
exports.lockFolder = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { password } = req.body;

    const folder = await Item.findOne({ _id: id, userId, type: 'folder' });

    if (!folder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Folder not found' 
      });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 4 digits' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    folder.password = hashedPassword;
    await folder.save();

    res.json({
      success: true,
      message: 'Folder locked successfully'
    });
  } catch (error) {
    console.error('Lock folder error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Unlock folder
exports.unlockFolder = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { password } = req.body;

    const folder = await Item.findOne({ _id: id, userId, type: 'folder' });

    if (!folder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Folder not found' 
      });
    }

    if (!folder.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Folder is not locked' 
      });
    }

    const isMatch = await bcrypt.compare(password, folder.password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password' 
      });
    }

    res.json({
      success: true,
      message: 'Folder unlocked successfully',
      folder
    });
  } catch (error) {
    console.error('Unlock folder error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Remove lock from folder
exports.removeLock = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { password } = req.body;

    const folder = await Item.findOne({ _id: id, userId, type: 'folder' });

    if (!folder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Folder not found' 
      });
    }

    if (!folder.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Folder is not locked' 
      });
    }

    const isMatch = await bcrypt.compare(password, folder.password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password' 
      });
    }

    folder.password = null;
    await folder.save();

    res.json({
      success: true,
      message: 'Lock removed successfully'
    });
  } catch (error) {
    console.error('Remove lock error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get folder contents
exports.getFolderContents = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const folder = await Item.findOne({ _id: id, userId, type: 'folder' });

    if (!folder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Folder not found' 
      });
    }

    const items = await Item.find({ parentFolder: id, userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      folder,
      items,
      isLocked: !!folder.password
    });
  } catch (error) {
    console.error('Get folder contents error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};