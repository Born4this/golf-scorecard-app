// routes/scores.js
const express   = require("express");
const Scorecard = require("../models/Scorecard");
const Group     = require("../models/Group");
const User      = require("../models/User");

module.exports = (io) => {
  const router = express.Router();

  // ----------------------------------
  // POST /api/scores
  // Create a new scorecard for a group
  // ----------------------------------
  router.post("/", async (req, res) => {
    try {
      const { groupId } = req.body;

      if (!groupId) {
        return res.status(400).json({ error: "groupId required" });
      }

      console.log("📩 Creating scorecard for group:", groupId);

      // Prevent duplicates
      const existing = await Scorecard.findOne({ groupId });
      if (existing) {
        return res.status(409).json({ error: "Scorecard already exists for this group" });
      }

      // Load group to determine gameType and users/teams
      const group = await Group.findById(groupId).populate("users");
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      // Build scores map: per-team for bestball, per-user for standard
      const scores = {};
      if (group.gameType === "bestball") {
        const teams = [...new Set(group.users.map((u) => u.team).filter(Boolean))];
        teams.forEach((team) => {
          scores[team] = new Array(18).fill(0);
        });
      } else {
        group.users.forEach((u) => {
          const id = u._id.toString();
          scores[id] = new Array(18).fill(0);
        });
      }

      const scorecard = new Scorecard({ groupId, scores });
      await scorecard.save();

      res.status(201).json(scorecard);
    } catch (err) {
      console.error("❌ Error creating scorecard:", err);
      res.status(500).json({ error: "Server error creating scorecard" });
    }
  });

  // ----------------------------------
  // PATCH /api/scores/update
  // Update a specific user's or team's hole score
  // ----------------------------------
  router.patch("/update", async (req, res) => {
    try {
      const { groupId, userId, holeIndex, strokes } = req.body;

      if (!groupId || !userId || holeIndex == null || strokes == null) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const scorecard = await Scorecard.findOne({ groupId });
      if (!scorecard) {
        return res.status(404).json({ error: "Scorecard not found" });
      }

      // Determine key: team name for bestball, userId string for standard
      const group = await Group.findById(groupId);
      let key;
      if (group?.gameType === "bestball") {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        key = user.team;
      } else {
        key = userId.toString();
      }

      // Initialize array if missing
      if (!scorecard.scores.has(key)) {
        scorecard.scores.set(key, new Array(18).fill(0));
      }

      // Update the strokes
      const arr = scorecard.scores.get(key);
      arr[holeIndex] = strokes;
      scorecard.scores.set(key, arr);

      scorecard.updatedAt = new Date();
      await scorecard.save();

      // Broadcast real-time update
      io.to(groupId).emit("scorecardUpdated", scorecard);

      res.status(200).json({ message: "Score updated", scores: scorecard.scores });
    } catch (err) {
      console.error("❌ Error updating score:", err);
      res.status(500).json({ error: "Error updating score" });
    }
  });

  // ----------------------------------
  // GET /api/scores/:groupId
  // Fetch the scorecard for a group
  // ----------------------------------
  router.get("/:groupId", async (req, res) => {
    try {
      const { groupId } = req.params;

      const scorecard = await Scorecard.findOne({ groupId });
      if (!scorecard) {
        return res.status(404).json({ error: "Scorecard not found" });
      }

      res.status(200).json(scorecard);
    } catch (err) {
      console.error("❌ Error fetching scorecard:", err);
      res.status(500).json({ error: "Error fetching scorecard" });
    }
  });

  return router;
};
