const supabase = require("../config/supabase");
const fs = require("fs");
const path = require("path");

// 📤 Upload File
exports.uploadFile = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const file = req.file;
    const { folder_id, owner_id } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = Date.now() + "_" + file.originalname;

    const { data, error } = await supabase.storage
      .from("files")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from("files")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    const { data: fileData, error: dbError } = await supabase
      .from("files")
      .insert([
        {
          name: file.originalname,
          path: fileName,
          url: publicUrl,
          folder_id: folder_id,
          owner_id: owner_id,
        },
      ]);

    if (dbError) {
      return res.status(400).json({ error: dbError.message });
    }

    res.json({
      message: "File uploaded successfully",
      file: fileData,
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ error: error.message });
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