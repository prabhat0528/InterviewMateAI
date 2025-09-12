const User = require("../models/user");
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

// ---------------- SIGNUP ----------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check all fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // checking if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // store user in session
    req.session.user = { id: newUser._id, name: newUser.name, email: newUser.email };

    return res.status(201).json({ 
      message: "User registered successfully",
      user: req.session.user 
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // store user in session
    req.session.user = { id: user._id, name: user.name, email: user.email };

    return res.status(200).json({ 
      message: "Login successful",
      user: req.session.user 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ---------------- LOGOUT ----------------
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out successfully" });
  });
});

// ---------------- SESSION ----------------
router.get("/session", (req, res) => {
  if (req.session.user) {
    return res.json({ user: req.session.user });
  }
  res.status(401).json({ message: "Not authenticated" });
});

module.exports = router;
