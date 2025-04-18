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
  userTeamMap: {
    type: Map,
    of: String,
    default: {}
  }
});

module.exports = mongoose.model("Group", groupSchema);
