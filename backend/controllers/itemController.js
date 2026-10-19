const Item = require("../models/Item");
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const fs = require("fs");
const path = require("path");

// Get items stats for dashboard
exports.getStats = async (req, res) => {
  try {
    const userId = req.session.userId;

    const items = await Item.find({ userId });

    // `usedStorage` reflects real disk usage (private vault included), while the
    // per-type counts/sizes drive UI lists which never show vault items.
    const visibleItems = items.filter((item) => !item.isLocked);

    let totalSize = 0;
    let folderCount = 0;
    let noteCount = 0;
    let imageCount = 0;
    let pdfCount = 0;
    let folderSize = 0;
    let noteSize = 0;
    let imageSize = 0;
    let pdfSize = 0;

    items.forEach((item) => {
      totalSize += item.fileSize || 0;
    });

    visibleItems.forEach((item) => {
      switch (item.type) {
        case "folder":
          folderCount++;
          folderSize += item.fileSize || 0;
          break;
        case "note":
          noteCount++;
          noteSize += item.content?.length || 0;
          break;
        case "image":
          imageCount++;
          imageSize += item.fileSize || 0;
          break;
        case "pdf":
          pdfCount++;
          pdfSize += item.fileSize || 0;
          break;
      }
    });

    const totalStorage = 15 * 1024 * 1024 * 1024; // 15GB in bytes
    const usedStorage = totalSize;
    const availableStorage = totalStorage - usedStorage;

    res.json({
      success: true,
      stats: {
        totalStorage,
        usedStorage,
        availableStorage,
        folders: { count: folderCount, size: folderSize },
        notes: { count: noteCount, size: noteSize },
        images: { count: imageCount, size: imageSize },
        pdfs: { count: pdfCount, size: pdfSize },
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get recent items
exports.getRecent = async (req, res) => {
  try {
    const userId = req.session.userId;
    const limit = parseInt(req.query.limit) || 10;

    // `.lean()` + strip the password hash (never sent to the client).
    const items = await Item.find({ userId, isLocked: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    items.forEach((it) => {
      delete it.password;
    });

    res.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Get recent error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all items with filters
exports.getItems = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { type, favorite, search, date, parentFolder, isLocked } = req.query;

    // Private-vault items stay out of every normal listing unless the caller
    // explicitly asks for them (GET /items/locked or ?isLocked=true).
    let query = { userId, isLocked: { $ne: true } };

    if (isLocked === "true") {
      query.isLocked = true;
    } else if (isLocked === "false") {
      query.isLocked = { $ne: true };
    }

    if (type) {
      query.type = type;
    }

    if (favorite === "true") {
      query.isFavorite = true;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Date filter runs in the client's local timezone so a full day is matched.
    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    // `parentFolder=` (present but empty) means "root level only".
    if (parentFolder !== undefined) {
      query.parentFolder = parentFolder ? parentFolder : null;
    }

    // `.lean()` gives plain objects so we can drop the password HASH (never
    // sent to the client). `isLocked` itself is the stored vault flag.
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .lean();

    items.forEach((it) => {
      delete it.password;
    });

    res.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Get items error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get single item
exports.getItem = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const item = await Item.findOne({ _id: id, userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Get item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Create item
exports.createItem = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { type, name, content, parentFolder, isLocked } = req.body;

    const itemData = {
      userId,
      type,
      name,
      content: content || "",
      parentFolder: parentFolder || null,
      // Sent as "true"/"false" from multipart forms, as booleans from JSON.
      isLocked: isLocked === true || isLocked === "true",
    };

    // Handle file upload
    if (req.file) {
      itemData.filePath = `/uploads/${req.file.filename}`;
      itemData.fileSize = req.file.size;
    }

    const item = new Item(itemData);
    await item.save();

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    console.error("Create item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const updates = req.body;

    const item = await Item.findOne({ _id: id, userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Update allowed fields
    const allowedUpdates = ["name", "content", "isFavorite", "isLocked"];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        // `isLocked` may arrive as "true"/"false" (forms) or boolean (JSON).
        if (key === "isLocked") {
          item.isLocked = updates[key] === true || updates[key] === "true";
        } else {
          item[key] = updates[key];
        }
      }
    });

    await item.save();

    res.json({
      success: true,
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const item = await Item.findOne({ _id: id, userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Delete file if exists
    if (item.filePath) {
      const filePath = path.join(__dirname, "..", item.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete item
    await Item.deleteOne({ _id: id });

    // Delete children if folder
    if (item.type === "folder") {
      const children = await Item.find({ parentFolder: id });
      for (const child of children) {
        if (child.filePath) {
          const childPath = path.join(__dirname, "..", child.filePath);
          if (fs.existsSync(childPath)) {
            fs.unlinkSync(childPath);
          }
        }
      }
      await Item.deleteMany({ parentFolder: id });
    }

    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Duplicate item
exports.duplicateItem = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const item = await Item.findOne({ _id: id, userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const duplicateData = {
      userId: item.userId,
      type: item.type,
      name: `${item.name} (Copy)`,
      content: item.content,
      parentFolder: item.parentFolder,
      // Copies must stay inside the private vault with their original.
      isLocked: !!item.isLocked,
    };

    // Copy file if exists
    if (item.filePath && item.type !== "folder") {
      const originalPath = path.join(__dirname, "..", item.filePath);
      if (fs.existsSync(originalPath)) {
        const ext = path.extname(originalPath);
        const newFilename = `${Date.now()}-copy${ext}`;
        const newPath = path.join(__dirname, "..", "uploads", newFilename);

        fs.copyFileSync(originalPath, newPath);
        duplicateData.filePath = `/uploads/${newFilename}`;
        duplicateData.fileSize = item.fileSize;
      }
    }

    const duplicate = new Item(duplicateData);
    await duplicate.save();

    res.status(201).json({
      success: true,
      message: "Item duplicated successfully",
      item: duplicate,
    });
  } catch (error) {
    console.error("Duplicate item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Toggle favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const item = await Item.findOne({ _id: id, userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    item.isFavorite = !item.isFavorite;
    await item.save();

    res.json({
      success: true,
      message: item.isFavorite
        ? "Added to favorites"
        : "Removed from favorites",
      item,
    });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Generate share link
exports.shareItem = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const item = await Item.findOne({ _id: id, userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (item.isLocked) {
      return res.status(400).json({
        success: false,
        message: "Private vault items cannot be shared",
      });
    }

    const shareLink = `${process.env.CLIENT_URL}/shared/${item._id}`;
    item.shareLink = shareLink;
    await item.save();

    res.json({
      success: true,
      message: "Share link generated",
      shareLink,
    });
  } catch (error) {
    console.error("Share item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get locked items only
exports.getLockedItems = async (req, res) => {
  try {
    // `isLocked` is the single source of truth for vault membership
    // (set by POST /items/:id/lock and POST /folders/:id/lock).
    const items = await Item.find({
      userId: req.session.userId,
      isLocked: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    items.forEach((it) => {
      delete it.password;
    });

    res.json({ success: true, items });
  } catch (error) {
    console.error("Get locked items error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* =================================================================== */
/*  Shared / vault / move — these four handlers are referenced by       */
/*  routes/itemRoutes.js but were MISSING from this file, so every      */
/*  call to them returned "Route not found" / crashed the router.       */
/* =================================================================== */

// Public share view — NO auth so anyone with the link can open the item
exports.getSharedItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findOne({ _id: id, isLocked: { $ne: true } });

    // Only items that explicitly generated a share link are visible.
    if (!item || !item.shareLink) {
      return res.status(404).json({
        success: false,
        message: "Shared item not found",
      });
    }

    res.json({
      success: true,
      item: {
        _id: item._id,
        type: item.type,
        name: item.name,
        content: item.content,
        filePath: item.filePath,
        fileSize: item.fileSize,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get shared item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Lock any item into the private vault (folder, note, image, pdf)
exports.lockItem = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const item = await Item.findOne({ _id: id, userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (item.isLocked) {
      return res.status(400).json({
        success: false,
        message: "Item is already in the vault",
      });
    }

    item.isLocked = true;
    await item.save();

    res.json({
      success: true,
      message: "Item moved to the private vault",
      item,
    });
  } catch (error) {
    console.error("Lock item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Unlock a vault item back to normal — requires the vault (lock) password
exports.unlockItem = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { password } = req.body;

    const item = await Item.findOne({ _id: id, userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (!item.isLocked) {
      return res.status(400).json({
        success: false,
        message: "Item is not locked",
      });
    }

    const user = await User.findById(userId);

    const vaultReady = user && user.hasLockPassword && user.lockPassword;
    if (!vaultReady && !item.password) {
      return res.status(400).json({
        success: false,
        message: "No vault password set yet",
      });
    }

    // Accept EITHER the folder's own password (password-protected folder in
    // the vault) OR the account-wide vault password.
    let isMatch = false;
    if (item.password) {
      isMatch = await bcrypt.compare(password || "", item.password);
    }
    if (!isMatch && vaultReady) {
      isMatch = await bcrypt.compare(password || "", user.lockPassword);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    item.isLocked = false;
    await item.save();

    res.json({
      success: true,
      message: "Item restored from the private vault",
      item,
    });
  } catch (error) {
    console.error("Unlock item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Move an item into / out of a folder (parentFolder in body; null/"" = root)
exports.moveItem = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { parentFolder } = req.body;

    const item = await Item.findOne({ _id: id, userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (parentFolder) {
      const parent = await Item.findOne({
        _id: parentFolder,
        userId,
        type: "folder",
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Destination folder not found",
        });
      }

      // Prevent moving a folder inside itself / one of its own descendants
      if (item.type === "folder" && String(parentFolder) === String(id)) {
        return res.status(400).json({
          success: false,
          message: "Cannot move a folder into itself",
        });
      }
    }

    item.parentFolder = parentFolder || null;
    await item.save();

    res.json({
      success: true,
      message: "Item moved",
      item,
    });
  } catch (error) {
    console.error("Move item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Bulk-lock many items into the private vault at once (used by the
// "Import to vault" flow). The VAULT password is verified once here.
exports.bulkLockItems = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { ids, password } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items selected",
      });
    }

    const user = await User.findById(userId);
    const vaultReady = user && user.hasLockPassword && user.lockPassword;

    if (!vaultReady) {
      return res.status(400).json({
        success: false,
        message: "No vault password set yet",
      });
    }

    const isMatch = await bcrypt.compare(password || "", user.lockPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect vault password",
      });
    }

    // Only the user's own, not-already-locked items move into the vault
    const result = await Item.updateMany(
      { _id: { $in: ids }, userId, isLocked: { $ne: true } },
      { $set: { isLocked: true } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} item${result.modifiedCount === 1 ? "" : "s"} moved to the private vault`,
      moved: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk lock error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* NOTE: `getItems` is intentionally defined only ONCE (see above).
   An earlier duplicate definition at the bottom of this file silently
   overwrote the primary one, dropping the root-folder and isLocked
   filters — that bug is fixed by keeping a single implementation. */
