const Item = require('../models/Item');
const bcrypt = require('bcryptjs');

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
    // `isLocked` is the single source of truth for "this folder is in the
    // vault / hidden from normal listings". The password gates ACCESS.
    folder.isLocked = true;
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

    // Unlock the session — hide-or-show is driven by `isLocked`, so clear it.
    // The password itself stays (it can be re-locked or verified again).
    folder.isLocked = false;
    await folder.save();

    // Unlock succeeds — also return the contents so the client can render
    // the folder immediately without a second round-trip.
    const items = await Item.find({ parentFolder: id, userId }).sort({ createdAt: -1 });

    // Never send the password HASH to the client — expose a boolean instead.
    const folderObj = folder.toObject();
    delete folderObj.password;
    folderObj.isLocked = false;

    res.json({
      success: true,
      message: 'Folder unlocked successfully',
      folder: folderObj,
      items,
      isLocked: false,
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
    // The vault flag must be cleared too — otherwise the folder keeps
    // `isLocked: true` and stays hidden in the vault forever, with no
    // password left to unlock it (a dead end).
    folder.isLocked = false;
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

    // `isLocked` (not the mere presence of a password) decides whether the
    // contents are gated — a session unlock clears the flag but keeps the
    // password for re-verification.
    const isLocked = !!folder.isLocked;

    // A locked folder never leaks its contents: the client must first
    // POST /folders/:id/unlock with the correct password.
    // `?unlocked=true` lets the client re-fetch right after a successful
    // unlock without being blocked again (the password itself stays).
    const unlockedAgain = req.query.unlocked === 'true';
    if (isLocked && !unlockedAgain) {
      return res.json({
        success: true,
        folder: {
          _id: folder._id,
          name: folder.name,
          type: folder.type,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          // The client renders the unlock prompt based on `folder.isLocked`,
          // so the flag MUST be present on the folder object itself.
          isLocked: true,
        },
        items: null,
        isLocked: true,
      });
    }

    // Never send the password HASH to the client — expose a boolean instead.
    const folderObj = folder.toObject();
    delete folderObj.password;
    folderObj.isLocked = false;

    res.json({
      success: true,
      folder: folderObj,
      items,
      isLocked: false,
    });
  } catch (error) {
    console.error('Get folder contents error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};