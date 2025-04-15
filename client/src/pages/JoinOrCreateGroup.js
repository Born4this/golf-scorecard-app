import { useState, useEffect } from "react";
import axios from "axios";

// Hardcode the API URL
const API_URL = "https://golf-scorecard-app-u07h.onrender.com"; // Replace with your actual Render backend URL

export default function JoinOrCreateGroup({ user, setGroup }) {
  const [groupName, setGroupName] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const groupFromURL = params.get("group");

    if (groupFromURL) {
      setJoinGroupId(groupFromURL);
    }
  }, []);

  const createGroup = async () => {
    if (!groupName) return alert("Enter a group name");

    try {
      const res = await axios.post(`${API_URL}/api/groups`, {
        groupName,
        userId: user._id
      });

      setGroup(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to create group");
    }
  };

  const joinGroup = async () => {
    if (!joinGroupId) return alert("Enter a group ID");

    try {
      const res = await axios.post(`${API_URL}/api/groups/join`, {
        groupId: joinGroupId,
        userId: user._id
      });

      setGroup(res.data.group);
    } catch (err) {
      console.error(err);
      alert("Failed to join group");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>Welcome, {user.name}</h2>

      <div style={{ marginBottom: 30 }}>
        <h3>Create a New Group</h3>
        <input
          type="text"
          placeholder="e.g., Team A"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10, fontSize: 16 }}
        />
        <button onClick={createGroup} style={{ width: "100%", padding: 10 }}>
          Create Group
        </button>
      </div>

      <div>
        <h3>Or Join an Existing Group</h3>
        <input
          type="text"
          placeholder="Enter Group ID"
          value={joinGroupId}
          onChange={(e) => setJoinGroupId(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10, fontSize: 16 }}
        />
        <button onClick={joinGroup} style={{ width: "100%", padding: 10 }}>
          Join Group
        </button>
      </div>
    </div>
  );
}