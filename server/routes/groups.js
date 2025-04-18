// routes/groups.js
const express = require("express");
const router  = express.Router();
const Group   = require("../models/Group");
const User    = require("../models/User");

/* ──────────────────────────────────────────────────────────
   CREATE a new group
   ────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────
   JOIN an existing group
   ────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────
   ADD a brand‑new team to a Best‑Ball group (optional route)
   ────────────────────────────────────────────────────────── */
router.post("/addTeam", async (req, res) => {
  const { groupId, teamName, memberIds } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.gameType !== "bestball") {
      return res.status(400).json({ message: "Teams only allowed in best‑ball mode" });
    }

    group.teams.push({ name: teamName, members: memberIds });
    await group.save();

    res.json(group);
  } catch (err) {
    console.error("❌ Error adding team:", err);
    res.status(500).json({ message: "Failed to add team" });
  }
});

/* ──────────────────────────────────────────────────────────
   JOIN (or create) a team inside a Best‑Ball group
   ────────────────────────────────────────────────────────── */
router.post("/join-team", async (req, res) => {
  const { groupId, userId, team } = req.body;

  try {
    // 1️⃣ Validate group & user
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.gameType !== "bestball") {
      return res.status(400).json({ message: "Not a best‑ball game" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2️⃣ Assign the user a team
    user.team = team;
    await user.save();

    // 3️⃣ Ensure the team exists in group.teams and contains this user
    let teamDoc = group.teams.find((t) => t.name === team);
    if (!teamDoc) {
      // Team doesn’t exist yet → create it
      teamDoc = { name: team, members: [user._id] };
      group.teams.push(teamDoc);
    } else {
      // Team exists → add user if missing
      if (!teamDoc.members.some((m) => m.toString() === user._id.toString())) {
        teamDoc.members.push(user._id);
      }
    }

    await group.save();

    // 4️⃣ Return the updated group populated with users
    const populated = await Group.findById(groupId).populate("users").lean();
    res.json({ group: populated });
  } catch (err) {
    console.error("❌ Error joining team:", err);
    res.status(500).json({ message: "Failed to join team" });
  }
});

module.exports = router;
