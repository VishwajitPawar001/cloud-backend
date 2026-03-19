const shares = require("../models/Share");

exports.shareFile = (req, res) => {

  const { fileId, userEmail, permission } = req.body;

  const newShare = {
    id: Date.now(),
    fileId,
    userEmail,
    permission
  };

  shares.push(newShare);

  res.json({
    message: "File shared successfully",
    share: newShare
  });

};

exports.getSharedFiles = (req, res) => {

  res.json({
    shares: shares
  });

};