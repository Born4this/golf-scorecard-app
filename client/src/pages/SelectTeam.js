// client/src/pages/SelectTeam.js
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://golf-scorecard-app-u07h.onrender.com";

export default function SelectTeam({ user, group, setGroup, setUser }) {
  const navigate = useNavigate();

  /** POST /api/groups/join‑team and update local state */
  const joinTeam = async (teamName) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/groups/join-team`, {
        userId:  user._id,
        groupId: group._id,
        team:    teamName
      });

      /* ---------- update React state + localStorage ---------- */
      const updatedUser  = { ...user, team: teamName };
      const updatedGroup = data.group;

      setUser(updatedUser);
      setGroup(updatedGroup);

      localStorage.setItem("user",  JSON.stringify(updatedUser));
      localStorage.setItem("group", JSON.stringify(updatedGroup));

      /* go back to the main page */
      navigate("/");
    } catch (err) {
      console.error("❌ Failed to join team:", err);
      alert("Something went wrong joining the team.");
    }
  };

  /* collect existing team names (if any) */
  const existingTeams = [
    ...new Set(
      (group.users || [])
        .filter((u) => u.team)
        .map((u) => u.team)
    ),
  ];

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 400,
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2>Choose a Team</h2>

      {existingTeams.map((team) => (
        <button
          key={team}
          onClick={() => joinTeam(team)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        >
          Join “{team}”
        </button>
      ))}

      <button
        onClick={() => joinTeam(`Team${Date.now()}`)}
        style={{ width: "100%", padding: 10 }}
      >
        Create New Team
      </button>
    </div>
  );
}
