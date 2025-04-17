import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../scorecard-style-additions.css";

const API_URL = "https://golf-scorecard-app-u07h.onrender.com";
const FRONTEND_URL = "https://live-scorecard.com";

const socket = io(API_URL);

export default function Scorecard({ user, group, scorecard, setScorecard }) {
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    socket.emit("joinGroup", group._id);
    socket.on("scorecardUpdated", (updated) => {
      setScorecard(updated);
    });
    return () => socket.off("scorecardUpdated");
  }, [group._id, setScorecard]);

  useEffect(() => {
    const fetchUserNames = async () => {
      if (!scorecard || !scorecard.scores) return;
      const userIds = Object.keys(scorecard.scores);
      try {
        const res = await axios.post(`${API_URL}/api/users/names`, { userIds });
        if (res.status === 200) setUserNames(res.data);
      } catch (err) {
        console.error("❌ Error fetching user names:", err);
      }
    };
    fetchUserNames();
  }, [scorecard]);

  if (!scorecard || !user || !group || !scorecard.scores[user._id]) {
    return <p>Loading scorecard...</p>;
  }

  const updateScore = async (holeIndex, strokes) => {
    try {
      await axios.patch(`${API_URL}/api/scores/update`, {
        groupId: group._id,
        userId: user._id,
        holeIndex,
        strokes
      });
    } catch (err) {
      console.error("❌ Error updating score:", err);
    }
  };

  const copyInviteLink = () => {
    const link = `${FRONTEND_URL}?group=${group._id}`;
    navigator.clipboard.writeText(link);
    alert("Invite link copied to clipboard!");
  };

  return (
    <div className="container">
      {/* Banner with group name overlay */}
      <div style={{ position: "relative", width: "100%", maxHeight: "250px", overflow: "hidden", marginBottom: "20px" }}>
        <img
          src="/scorecard-banner.png" // Make sure to save your converted PNG in public folder
          alt="Scorecard Banner"
          style={{ width: "100%", objectFit: "cover", maxHeight: "250px", display: "block" }}
        />
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.85))",
          zIndex: 1
        }} />
        <h2 style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#007bff",
          zIndex: 2,
          fontSize: "2.5rem",
          fontWeight: "bold",
          textShadow: "0 2px 6px rgba(0,0,0,0.7)",
          textAlign: "center",
          margin: 0
        }}>
          {group.groupName}
        </h2>
      </div>

      {/* Copy Invite Button */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <button
          onClick={copyInviteLink}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            fontSize: 14,
            cursor: "pointer"
          }}
        >
          Copy Invite Link
        </button>
      </div>

      {/* Scorecard Table */}
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Hole</th>
            {Object.keys(scorecard.scores).map((uid) => (
              <th key={uid}>
                {uid === user._id ? "You" : userNames[uid] || "Player"}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {[...Array(18)].map((_, holeIndex) => (
            <tr key={holeIndex}>
              <td>{holeIndex + 1}</td>
              {Object.entries(scorecard.scores).map(([uid, scores]) => {
                const isCurrentUser = uid === user._id;
                const value = scores?.[holeIndex] ?? 0;
                const inputClass = value > 0 ? "filled score-animated" : "";

                return (
                  <td key={uid}>
                    {isCurrentUser ? (
                      <input
                        type="number"
                        value={value}
                        min="0"
                        className={inputClass}
                        style={{ fontSize: 16 }}
                        onFocus={(e) => {
                          if (e.target.value === "0") {
                            e.target.value = "";
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            updateScore(holeIndex, 0);
                          }
                        }}
                        onChange={(e) =>
                          updateScore(holeIndex, Number(e.target.value))
                        }
                      />
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td>Total</td>
            {Object.values(scorecard.scores).map((scores, idx) => (
              <td key={idx}>
                {scores.reduce((sum, s) => sum + s, 0)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>

      {/* Leave Group Button */}
      <div style={{ marginTop: 40, textAlign: "center" }}>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          style={{
            backgroundColor: "#ccc",
            color: "#333",
            padding: "10px 16px",
            fontSize: 14,
            borderRadius: 10,
            border: "none",
            cursor: "pointer"
          }}
        >
          Leave Group
        </button>
      </div>
    </div>
  );
}