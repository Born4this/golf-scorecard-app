const mongoose = require("mongoose");

const ScorecardSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  scores: {
    type: Map,
    of: [Number] // each key is a userId, value is an array of scores (18 holes)
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Scorecard", ScorecardSchema);