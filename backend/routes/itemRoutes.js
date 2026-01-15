const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const itemController = require("../controllers/itemController");
const auth = require("../middleware/auth");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// All routes require authentication
router.use(auth);

// Get stats
router.get("/stats", itemController.getStats);

// Get recent items
router.get("/recent", itemController.getRecent);

// Get all items with filters
router.get("/", itemController.getItems);

// Get single item
router.get("/:id", itemController.getItem);

// Create item
router.post("/", upload.single("file"), itemController.createItem);

// Update item
router.put("/:id", itemController.updateItem);

// Delete item
router.delete("/:id", itemController.deleteItem);

// Duplicate item
router.post("/:id/duplicate", itemController.duplicateItem);

// Toggle favorite
router.patch("/:id/favorite", itemController.toggleFavorite);

// Share item
router.post("/:id/share", itemController.shareItem);
router.get("/locked", auth, itemController.getLockedItems);

module.exports = router;
