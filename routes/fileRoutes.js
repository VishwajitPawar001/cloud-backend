const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const auth = require("../middleware/authMiddleware");
const fileController = require("../controllers/fileController");

// Upload
router.post("/upload", auth, upload.single("file"), fileController.uploadFile);

// Root files
router.get("/", auth, fileController.getFiles);

// Files by folder
router.get("/folder/:folderId", auth, fileController.getFilesByFolder);

// Trash
router.get("/trash", auth, fileController.getTrashFiles);

// Soft delete
router.delete("/:id", auth, fileController.deleteFile);

// Restore
router.put("/restore/:id", auth, fileController.restoreFile);

// Permanent delete
router.delete("/permanent/:id", auth, fileController.permanentDeleteFile);

// Internal share
router.post("/share", auth, fileController.shareFile);
router.get("/shared", auth, fileController.getSharedFiles);

// Public share link
router.get("/share-link/:id", auth, fileController.generateShareLink);

// Public access
router.get("/public/:token", fileController.getPublicFile);

module.exports = router;