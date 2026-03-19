const express = require("express");

const router = express.Router();

const folderController = require("../controllers/folderController");

router.post("/create", folderController.createFolder);

router.get("/", folderController.getFolders);

module.exports = router;