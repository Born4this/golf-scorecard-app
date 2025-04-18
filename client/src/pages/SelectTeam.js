// client/src/pages/SelectTeam.js
import { useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://golf-scorecard-app-u07h.onrender.com";

export default function SelectTeam({ user, group, setGroup }) {
  const navigate = useNavigate();

  /* -------------------------------------------
     Build a de‑duplicated list of existing teams
  -------------------------------------------- */
  const existingTeams = useMemo(() => {
    if (!group?.users) return [];

    return [
      ...new Set(
        group.users
          .filter((u) => typeof u === "object" && u.team) // only objects with a team field
          .map((u) => u.team)
      ),
    ];
  }, [group]);

  /* -------------------------------------------
     Join or create a team, then return to / (scorecard)
  -------------------------------------------- */
  const joinTeam = async (teamName) => {
    try {
      const res = await axios.post(`${API_URL}/api/groups/join-team`, {
        userId:  user._id,
        groupId: group._id,
        team:    teamName,
      });

      if (res.status === 200) {
        const updatedGroup = res.data.group;
        const updatedUser  = { ...user, team: teamName };

        // persist to localStorage so refreshes keep the state
        localStorage.setItem("group", JSON.stringify(updatedGroup));
        localStorage.setItem("user",  JSON.stringify(updatedUser));

        setGroup(updatedGroup);          // lift state up
        navigate("/");                   // back to the scorecard
      }
    } catch (err) {
      console.error("❌ Failed to join team", err);
      alert("Something went wrong joining the team.");
    }
  };

  /* -------------------------------------------
     Render
  -------------------------------------------- */
  return (
    <div
      style={{
        padding: 20,
        maxWidth: 400,
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Choose a Team</h2>

      {existingTeams.map((team) => (
        <button
          key={team}
          onClick={() => joinTeam(team)}
          style={{
            width:        "100%",
            padding:      12,
            marginBottom: 12,
            border:       "none",
            borderRadius: 8,
            background:   "#007bff",
            color:        "#fff",
            cursor:       "pointer",
          }}
        >
          Join “{team}”
        </button>
      ))}

      <button
        onClick={() => joinTeam(`Team-${Date.now().toString(36).slice(-4)}`)}
        style={{
          width:        "100%",
          padding:      12,
          border:       "none",
          borderRadius: 8,
          background:   "#28a745",
          color:        "#fff",
          cursor:       "pointer",
        }}
      >
        Create New Team
      </button>
    </div>
  );
}
