const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Group", GroupSchema);