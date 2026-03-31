const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const auth = require("../middleware/authMiddleware");
const fileController = require("../controllers/fileController");

// 📤 Upload file
router.post("/upload", auth, upload.single("file"), fileController.uploadFile);

// 📄 Get all files (root)
router.get("/", auth, fileController.getFiles);

// 📁 Get files by folder
router.get("/folder/:folderId", auth, fileController.getFilesByFolder);

// 🗑️ Get trash files
router.get("/trash", auth, fileController.getTrashFiles);

// 🔗 Share file
router.post("/share", auth, fileController.shareFile);

// 📥 Files shared with me
router.get("/shared", auth, fileController.getSharedFiles);

// 🔁 Restore file
router.put("/restore/:id", auth, fileController.restoreFile);

// ❌ Permanent delete
router.delete("/permanent/:id", auth, fileController.permanentDeleteFile);

// 🗑️ Soft delete (move to trash) → KEEP LAST
router.delete("/:id", auth, fileController.deleteFile);

module.exports = router;