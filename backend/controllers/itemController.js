const Item = require("../models/Item");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// Get items stats for dashboard
exports.getStats = async (req, res) => {
  try {
    const userId = req.session.userId;

    const items = await Item.find({ userId });

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

    const items = await Item.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit);

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
    const { type, favorite, search, date, parentFolder } = req.query;

    let query = { userId };

    if (type) {
      query.type = type;
    }

    if (favorite === "true") {
      query.isFavorite = true;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    if (parentFolder) {
      query.parentFolder = parentFolder;
    } else if (req.query.hasOwnProperty("parentFolder")) {
      query.parentFolder = null;
    }

    const items = await Item.find(query).sort({ createdAt: -1 });

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
    const { type, name, content, parentFolder } = req.body;

    const itemData = {
      userId,
      type,
      name,
      content: content || "",
      parentFolder: parentFolder || null,
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
    const allowedUpdates = ["name", "content", "isFavorite"];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        item[key] = updates[key];
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
    const items = await Item.find({
      userId: req.session.userId,
      isLocked: true,
    }).sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (error) {
    console.error("Get locked items error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const { type, favorite, search, date, parentFolder } = req.query;

    let filter = { userId: req.session.userId };

    if (type) filter.type = type;
    if (favorite === "true") filter.isFavorite = true;
    if (parentFolder) filter.parentFolder = parentFolder;

    // ✅ FIXED: Proper date filtering with local timezone
    if (date) {
      // Parse date as YYYY-MM-DD in local timezone
      const [year, month, day] = date.split("-").map(Number);

      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

      console.log("Date filter:", { date, startDate, endDate }); // Debug log

      filter.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });

    console.log(`Found ${items.length} items for date ${date}`); // Debug log

    res.json({ success: true, items });
  } catch (error) {
    console.error("Get items error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
