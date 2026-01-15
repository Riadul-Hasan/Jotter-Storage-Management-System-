const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get folder contents
router.get('/:id/contents', folderController.getFolderContents);

// Lock folder
router.post('/:id/lock', folderController.lockFolder);

// Unlock folder
router.post('/:id/unlock', folderController.unlockFolder);

// Remove lock
router.post('/:id/remove-lock', folderController.removeLock);

module.exports = router;