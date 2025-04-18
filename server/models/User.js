// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  /*  Which group the user is currently in (nullable)  */
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  },

  /*  The team name for Best‑Ball games (nullable)  */
  team: {
    type: String,
    default: null,
  },

  /*  “Guest” accounts automatically expire if desired  */
  isTemporary: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
