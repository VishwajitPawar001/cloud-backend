const supabase = require("../config/supabase");

// 📤 Upload File
exports.uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const { folder_id } = req.body;
    const owner_id = req.user.id;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Clean filename
    const cleanName = file.originalname.replace(/\s+/g, "_");
    const fileName = `${Date.now()}_${cleanName}`;

    // Store inside folder in bucket
    const storagePath = `user_${owner_id}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("files")
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      return res.status(400).json({ error: uploadError.message });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("files")
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // Save in DB
    const { data, error: dbError } = await supabase
      .from("files")
      .insert([
        {
          name: file.originalname,
          path: storagePath,
          url: publicUrl,
          folder_id: folder_id || 1,
          owner_id: owner_id,
          is_deleted: false,
        },
      ])
      .select();

    if (dbError) {
      return res.status(400).json({ error: dbError.message });
    }

    res.json({
      message: "File uploaded successfully",
      file: data[0],
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// 📄 Get All Files (Root)
exports.getFiles = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_deleted", false)
      .order("id", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ files: data || [] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📁 Get Files By Folder
exports.getFilesByFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.params.folderId;

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", userId)
      .eq("folder_id", folderId)
      .eq("is_deleted", false)
      .order("id", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ files: data || [] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🗑️ Get Trash Files
exports.getTrashFiles = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_deleted", true)
      .order("id", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ files: data || [] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🗑️ Soft Delete
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

    res.json({ message: "File moved to trash" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔁 Restore
exports.restoreFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    const { error } = await supabase
      .from("files")
      .update({ is_deleted: false })
      .eq("id", fileId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "File restored" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Permanent Delete
exports.permanentDeleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    // Get file path
    const { data, error: fetchError } = await supabase
      .from("files")
      .select("path")
      .eq("id", fileId)
      .single();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    const filePath = data.path;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("files")
      .remove([filePath]);

    if (storageError) {
      return res.status(400).json({ error: storageError.message });
    }

    // Delete from DB
    const { error } = await supabase
      .from("files")
      .delete()
      .eq("id", fileId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "File permanently deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};