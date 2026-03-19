const supabase = require("../config/supabase");
const fs = require("fs");
const path = require("path");

// 📤 Upload File
exports.uploadFile = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const folder_id = req.body.folder_id || "1"; // ✅ default root
    const owner_id = req.body.owner_id || "1";

    const filename = req.file.filename;

    const { data, error } = await supabase
      .from("files")
      .insert([
        {
          name: filename,
          folder_id,
          owner_id,
          is_deleted: false
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "File uploaded successfully",
      file: data[0]
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// 📄 Get All Files
exports.getFiles = async (req, res) => {
  try {

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      files: data || []
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📥 Download File
exports.downloadFile = (req, res) => {

  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: "File not found"
    });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      res.status(500).json({
        message: "Error downloading file"
      });
    }
  });
};

// 🗑️ Soft Delete (Move to Trash)
exports.deleteFile = async (req, res) => {
  try {

    const fileId = req.params.id;

    const { error } = await supabase
      .from("files")
      .update({ is_deleted: true })
      .eq("id", fileId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "File moved to trash"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// 🔁 Restore File
exports.restoreFile = async (req, res) => {
  try {

    const { id } = req.params;

    const { error } = await supabase
      .from("files")
      .update({ is_deleted: false })
      .eq("id", id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "File restored" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Permanent Delete (DB + File System)
exports.permanentDeleteFile = async (req, res) => {
  try {

    const { id } = req.params;

    // 1️⃣ Get file name first
    const { data, error: fetchError } = await supabase
      .from("files")
      .select("name")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    const filename = data?.name;

    // 2️⃣ Delete from DB
    const { error } = await supabase
      .from("files")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // 3️⃣ Delete from local storage
    if (filename) {
      const filePath = path.join(__dirname, "../uploads", filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: "File permanently deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};