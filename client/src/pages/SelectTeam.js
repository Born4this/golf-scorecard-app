// SelectTeam.js
import { useState } from "react";

export default function SelectTeam({ user, group, setGroup }) {
  const [teamChoice, setTeamChoice] = useState("");

  const joinTeam = (teamName) => {
    const updatedUser = { ...user, team: teamName };
    const updatedGroup = {
      ...group,
      users: group.users.map((u) =>
        u._id === user._id ? updatedUser : u
      )
    };
    setGroup(updatedGroup);
  };

  const existingTeams = [
    ...new Set(group.users.filter(u => u.team).map(u => u.team))
  ];

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
