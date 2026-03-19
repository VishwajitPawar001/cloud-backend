const express = require("express");

const router = express.Router();

const shareController = require("../controllers/shareController");

router.post("/share", shareController.shareFile);

router.get("/", shareController.getSharedFiles);

module.exports = router;