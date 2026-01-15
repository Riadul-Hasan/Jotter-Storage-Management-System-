const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const profileController = require("../controllers/profileController");
const auth = require("../middleware/auth");

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images are allowed for avatar"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// All routes require authentication
router.use(auth);

// Get profile
router.get("/", profileController.getProfile);

// Update profile
router.put("/", upload.single("avatar"), profileController.updateProfile);

// Change password
router.post("/change-password", profileController.changePassword);

// Delete account
router.delete("/", profileController.deleteAccount);
router.post("/set-lock-password", auth, profileController.setLockPassword);
router.post(
  "/verify-lock-password",
  auth,
  profileController.verifyLockPassword
);

module.exports = router;
