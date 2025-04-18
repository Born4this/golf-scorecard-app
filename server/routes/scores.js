const express = require("express");
const Scorecard = require("../models/Scorecard");

module.exports = (io) => {
  const router = express.Router();

  // ----------------------------------
  // POST /api/scores
  // Create a new scorecard for a group
  // ----------------------------------
  router.post("/", async (req, res) => {
    try {
      const { groupId, users } = req.body;

      if (!groupId || !Array.isArray(users)) {
        return res.status(400).json({ error: "groupId and users (array) required" });
      }

      // Log incoming users for debugging
      console.log("📩 Creating scorecard with users:", users);

      // Prevent duplicates
      const existing = await Scorecard.findOne({ groupId });
      if (existing) {
        return res.status(409).json({ error: "Scorecard already exists for this group" });
      }

      // Create scores map — support both string IDs and user objects
      const scores = {};
      users.forEach((u) => {
        const id = typeof u === "object" ? u._id : u;
        if (id) scores[id.toString()] = new Array(18).fill(0);
      });

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
  // Update a specific user's hole score
  // ----------------------------------
  router.patch("/update", async (req, res) => {
    try {
      const { groupId, userId, holeIndex, strokes } = req.body;

      if (!groupId || !userId || holeIndex == null || strokes == null) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const scorecard = await Scorecard.findOne({ groupId });
      if (!scorecard) return res.status(404).json({ error: "Scorecard not found" });

      const userIdStr = userId.toString();

      if (!scorecard.scores.has(userIdStr)) {
        scorecard.scores.set(userIdStr, new Array(18).fill(0));
      }

      const userScores = scorecard.scores.get(userIdStr);
      userScores[holeIndex] = strokes;
      scorecard.scores.set(userIdStr, userScores);

      scorecard.updatedAt = new Date();
      await scorecard.save();

      // 🔁 Broadcast real-time update
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
      if (!scorecard) return res.status(404).json({ error: "Scorecard not found" });

      res.status(200).json(scorecard);
    } catch (err) {
      console.error("❌ Error fetching scorecard:", err);
      res.status(500).json({ error: "Error fetching scorecard" });
    }
  });

  return router;
};
