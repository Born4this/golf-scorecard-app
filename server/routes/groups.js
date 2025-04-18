// routes/groups.js
const express = require("express");
const router  = express.Router();
const Group   = require("../models/Group");
const User    = require("../models/User");

/* ----------  create group  ---------- */
router.post("/", async (req, res) => {
  const { groupName, userId, gameType = "standard" } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newGroup = new Group({ groupName, users: [userId], gameType });
    const saved    = await newGroup.save();
    res.json(saved);
  } catch (err) {
    console.error("❌ Error creating group:", err);
    res.status(500).json({ message: "Failed to create group" });
  }
});

/* ----------  join group  ---------- */
router.post("/join", async (req, res) => {
  const { groupId, userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.users.includes(userId)) group.users.push(userId);
    await group.save();

    const populated = await Group.findById(groupId).populate("users");
    res.json({ group: populated });
  } catch (err) {
    console.error("❌ Error joining group:", err);
    res.status(500).json({ message: "Failed to join group" });
  }
});

/* ----------  add team (optional)  ---------- */
router.post("/addTeam", async (req, res) => {
  const { groupId, teamName, memberIds } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.gameType !== "bestball")
      return res.status(400).json({ message: "Teams allowed only in best‑ball" });

    group.teams.push({ name: teamName, members: memberIds });
    await group.save();

    const populated = await Group.findById(groupId).populate("users");
    res.json(populated);
  } catch (err) {
    console.error("❌ Error adding team:", err);
    res.status(500).json({ message: "Failed to add team" });
  }
});

/* ----------  join team (BEST‑BALL)  ---------- */
router.post("/join-team", async (req, res) => {
  const { groupId, userId, team } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.gameType !== "bestball")
      return res.status(400).json({ message: "Not a best‑ball game" });

    /* 1️⃣  update the user's team field */
    const user = await User.findByIdAndUpdate(
      userId,
      { team },
      { new: true }           // return the updated document
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    /* ensure the user is listed in the group (safety) */
    if (!group.users.map(String).includes(userId)) {
      group.users.push(userId);
      await group.save();
    }

    /* 2️⃣  populate again so each user in group.users has .team */
    const populated = await Group.findById(groupId).populate("users");

    return res.json({ group: populated });
  } catch (err) {
    console.error("❌ Error joining team:", err);
    res.status(500).json({ message: "Failed to join team" });
  }
});

module.exports = router;
