const supabase = require("../config/supabase");

exports.createFolder = async (req, res) => {

  const { name, owner_id } = req.body;

  try {

    const { data, error } = await supabase
      .from("folders")
      .insert([
        {
          name: name,
          owner_id: owner_id
        }
      ]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "Folder created successfully",
      data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

exports.getFolders = async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("folders")
      .select("*");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      folders: data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};