const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const itemController = require("../controllers/itemController");
const auth = require("../middleware/auth");

// Absolute destination — independent of the process working directory so
// uploaded files always land in backend/uploads (served at /uploads).
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images and PDFs are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: {}, // Removed 10MB limit
  fileFilter: fileFilter,
});

// All routes require authentication
router.use(auth);

// Get stats
router.get("/stats", itemController.getStats);

// Get recent items
router.get("/recent", itemController.getRecent);

// Get locked items only (MUST come before /:id so "locked" isn't treated as an id)
router.get("/locked", itemController.getLockedItems);

// Public share view — no login required so anyone with the link can open it
router.get("/shared/:id", itemController.getSharedItem);

// Get all items with filters
router.get("/", itemController.getItems);

// Get single item
router.get("/:id", itemController.getItem);

// Create item
router.post("/", upload.single("file"), itemController.createItem);

// Update item
router.put("/:id", upload.single("file"), itemController.updateItem);

// Delete item
router.delete("/:id", itemController.deleteItem);

// Duplicate item
router.post("/:id/duplicate", itemController.duplicateItem);

// Move item into / out of a folder
router.patch("/:id/move", itemController.moveItem);

// Toggle favorite
router.patch("/:id/favorite", itemController.toggleFavorite);

// Lock item into the private vault (any type)
router.post("/:id/lock", itemController.lockItem);

// Bulk-lock items into the vault (import flow — verified vault password)
router.post("/bulk-lock", itemController.bulkLockItems);

// Unlock a vault item back to normal (needs vault password)
router.post("/:id/unlock", itemController.unlockItem);

// Share item
router.post("/:id/share", itemController.shareItem);

module.exports = router;
