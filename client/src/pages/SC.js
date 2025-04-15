import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// Hardcode the API URL to bypass environment variable issues
const API_URL = "https://golf-scorecard-app-u07h.onrender.com";
const FRONTEND_URL = "https://golf-scorecard-app.vercel.app";

// Connect to your backend Socket.io server
const socket = io(API_URL);

export default function Scorecard({ user, group, scorecard, setScorecard }) {
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    socket.emit("joinGroup", group._id);

    socket.on("scorecardUpdated", (updated) => {
      setScorecard(updated);
    });

    return () => {
      socket.off("scorecardUpdated");
    };
  }, [group._id, setScorecard]);

  useEffect(() => {
    const fetchUserNames = async () => {
      if (!scorecard || !scorecard.scores) return;

      const userIds = Object.keys(scorecard.scores);

      try {
        const res = await axios.post(`${API_URL}/api/users/names`, {
          userIds
        });

        if (res.status === 200) {
          setUserNames(res.data);
        }
      } catch (err) {
        console.error("❌ Error fetching user names:", err);
      }
    };

    fetchUserNames();
  }, [scorecard]);

  if (!scorecard) return <p>Loading scorecard...</p>;

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
      <h2>{group.groupName}</h2>

      <div style={{
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
        border: "1px solid #ddd",
        fontSize: 14,
        textAlign: "center"
      }}>
        <button onClick={copyInviteLink}>
          Copy Invite Link
        </button>
      </div>

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
              <td>H{holeIndex + 1}</td>
              {Object.entries(scorecard.scores).map(([uid, scores]) => (
                <td key={uid}>
                  {uid === user._id ? (
                    <input
                      type="number"
                      value={scores[holeIndex]}
                      min="0"
                      style={{ fontSize: 16 }}
                      onFocus={(e) => {
                        if (e.target.value === "0") {
                          e.target.value = "";
                        }
                      }}
                      onChange={(e) =>
                        updateScore(holeIndex, Number(e.target.value))
                      }
                    />
                  ) : (
                    scores[holeIndex]
                  )}
                </td>
              ))}
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
