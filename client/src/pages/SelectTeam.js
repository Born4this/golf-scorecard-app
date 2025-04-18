// SelectTeam.js
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://golf-scorecard-app-u07h.onrender.com";

export default function SelectTeam({ user, group, setGroup }) {
  const navigate = useNavigate();

  const joinTeam = async (teamName) => {
    try {
      const res = await axios.post(`${API_URL}/api/groups/join-team`, {
        userId: user._id,
        groupId: group._id,
        team: teamName
      });

      if (res.status === 200) {
        setGroup(res.data.group);
        navigate("/");
      }
    } catch (err) {
      console.error("❌ Failed to join team", err);
      alert("Something went wrong joining the team.");
    }
  };

  // Get existing teams from userTeamMap
  const existingTeams = group.userTeamMap
    ? [...new Set(Object.values(group.userTeamMap))]
    : [];

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>Choose a Team</h2>

      {existingTeams.map((team) => (
        <button
          key={team}
          onClick={() => joinTeam(team)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        >
          Join "{team}"
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
