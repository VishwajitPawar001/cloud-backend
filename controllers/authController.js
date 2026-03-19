const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

exports.signup = async (req, res) => {

  const { email, password } = req.body;

  try {

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: email,
          password: hashedPassword
        }
      ]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "User registered successfully",
      data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

exports.login = async (req, res) => {

  const { email, password } = req.body;

  try {

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const validPassword = await bcrypt.compare(password, data.password);

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      { id: data.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};