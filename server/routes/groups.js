const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const User = require("../models/User");
const Scorecard = require("../models/Scorecard");

// ----------------------------------
// Create a new group with 1 user
// ----------------------------------
router.post("/", async (req, res) => {
  try {
    const { groupName, userId } = req.body;

    if (!groupName || !userId) {
      return res.status(400).json({ error: "groupName and userId are required" });
    }

    const group = new Group({
      groupName,
      users: [userId],
    });

    await group.save();

    // Link user to group
    await User.findByIdAndUpdate(userId, { groupId: group._id });

    res.status(201).json(group);
  } catch (err) {
    console.error("❌ Error creating group:", err);
    res.status(500).json({ error: "Server error creating group" });
  }
});

// ----------------------------------
// Join an existing group
// ----------------------------------
router.post("/join", async (req, res) => {
  try {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
      return res.status(400).json({ error: "groupId and userId are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Add user to group if not already in it
    if (!group.users.includes(userId)) {
      group.users.push(userId);
      await group.save();
    }

    // Link user to group
    await User.findByIdAndUpdate(userId, { groupId });

    // ✅ Update scorecard if one exists
    const scorecard = await Scorecard.findOne({ groupId });
    if (scorecard) {
      const userIdStr = userId.toString();
      const currentUserIds = Array.from(scorecard.scores.keys()).map((k) => k.toString());

      if (!currentUserIds.includes(userIdStr)) {
        scorecard.scores.set(userIdStr, new Array(18).fill(0));
        await scorecard.save();
        console.log("✅ Added user to scorecard:", userIdStr);
      } else {
        console.log("ℹ️ User already in scorecard:", userIdStr);
      }

      console.log("📋 Updated scorecard:", {
        groupId: scorecard.groupId,
        users: Array.from(scorecard.scores.keys())
      });
    } else {
      console.log("⚠️ No scorecard found for group yet");
    }

    res.status(200).json({ message: "User added to group", group });
  } catch (err) {
    console.error("❌ Error joining group:", err);
    res.status(500).json({ error: "Server error joining group" });
  }
});

module.exports = router;
