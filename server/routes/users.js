const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ POST /api/users — create a new user
router.post("/", async (req, res) => {
  try {
    const { name, isTemporary = true } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const newUser = new User({ name, isTemporary });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ error: "Server error creating user" });
  }
});

// ✅ POST /api/users/names — get userId → name map
router.post("/names", async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: "userIds must be an array" });
    }

    const users = await User.find({ _id: { $in: userIds } });
    const nameMap = {};
    users.forEach(user => {
      nameMap[user._id.toString()] = user.name;
    });

    res.status(200).json(nameMap);
  } catch (err) {
    console.error("❌ Error fetching names:", err);
    res.status(500).json({ error: "Failed to fetch user names" });
  }
});

module.exports = router;
