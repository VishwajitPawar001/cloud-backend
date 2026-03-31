const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const auth = require("../middleware/authMiddleware");
const fileController = require("../controllers/fileController");

// 📤 Upload file
router.post("/upload", auth, upload.single("file"), fileController.uploadFile);

// 📄 Get all files
router.get("/", auth, fileController.getFiles);

// 🗑️ Get trash files
router.get("/trash", auth, fileController.getTrashFiles);

// 🗑️ Soft delete (move to trash)
router.delete("/:id", auth, fileController.deleteFile);

// 🔁 Restore file
router.put("/restore/:id", auth, fileController.restoreFile);

// ❌ Permanent delete
router.delete("/permanent/:id", auth, fileController.permanentDeleteFile);

module.exports = router;