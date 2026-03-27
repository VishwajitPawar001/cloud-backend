const multer = require("multer");

// Store file in memory instead of disk
const storage = multer.memoryStorage();

// File filter (optional but recommended)
const fileFilter = (req, file, cb) => {
  // Accept all file types
  cb(null, true);
};

// Limits (optional)
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB max file size
};

// Multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});

module.exports = upload;