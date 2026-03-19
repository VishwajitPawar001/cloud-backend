const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const fileController = require("../controllers/fileController");

// 📤 Upload file
router.post("/upload", upload.single("file"), fileController.uploadFile);

// 📄 Get all files
router.get("/", fileController.getFiles);

// 📥 Download file
router.get("/download/:filename", fileController.downloadFile);

// 🗑️ Soft delete (move to trash)
router.delete("/:id", fileController.deleteFile);

// 🔁 Restore file
router.put("/restore/:id", fileController.restoreFile);

// ❌ Permanent delete
router.delete("/permanent/:id", fileController.permanentDeleteFile);

module.exports = router;