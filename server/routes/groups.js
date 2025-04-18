const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const User = require("../models/User");

// Create new group
router.post("/", async (req, res) => {
  const { groupName, userId, gameType = "standard" } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newGroup = new Group({
      groupName,
      users: [userId],
      gameType
    });

    const savedGroup = await newGroup.save();
    res.json(savedGroup);
  } catch (err) {
    console.error("❌ Error creating group:", err);
    res.status(500).json({ message: "Failed to create group" });
  }
});

// Join group
router.post("/join", async (req, res) => {
  const { groupId, userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.users.includes(userId)) {
      group.users.push(userId);
    }

    const savedGroup = await group.save();
    res.json({ group: savedGroup });
  } catch (err) {
    console.error("❌ Error joining group:", err);
    res.status(500).json({ message: "Failed to join group" });
  }
});

// Add team to a group (Best Ball only)
router.post("/addTeam", async (req, res) => {
  const { groupId, teamName, memberIds } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.gameType !== "bestball") {
      return res.status(400).json({ message: "Teams only allowed in bestball mode" });
    }

    group.teams.push({
      name: teamName,
      members: memberIds
    });

    await group.save();
    res.json(group);
  } catch (err) {
    console.error("❌ Error adding team:", err);
    res.status(500).json({ message: "Failed to add team" });
  }
});

module.exports = router;
