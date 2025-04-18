const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  groupId:     { type: String },            // links this user to a group
  team:        { type: String, default: null }, // <-- added for Best‑Ball teams
  isTemporary: { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
