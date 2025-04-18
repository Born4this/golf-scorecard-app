const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  gameType: {
    type: String,
    enum: ["standard", "bestball"],
    default: "standard"
  },
  teams: [
    {
      name: String, // optional: e.g. "Team A"
      members: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      ]
    }
  ]
});

module.exports = mongoose.model("Group", groupSchema);
