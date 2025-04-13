import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// Safely access VITE_API_URL with a fallback
const API_URL = import.meta.env.VITE_API_URL || "https://your-backend-url.onrender.com"; // Replace with your Render URL as a fallback

// Validate the API URL before using it
if (!API_URL) {
  console.error("❌ VITE_API_URL is not defined and no fallback provided. Socket.io and API requests will fail.");
}

// Connect to your backend Socket.io server only if API_URL is defined
const socket = API_URL ? io(API_URL) : null;

export default function Scorecard({ user, group, scorecard, setScorecard }) {
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    if (!socket) {
      console.error("❌ Socket.io connection not established due to missing API_URL.");
      return;
    }

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
      if (!scorecard || !scorecard.scores || !API_URL) {
        console.error("❌ Cannot fetch user names: Missing scorecard, scores, or API_URL.");
        return;
      }

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
    if (!API_URL) {
      console.error("❌ Cannot update score: API_URL is not defined.");
      return;
    }

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

  return (
    <div className="container">
      <h2>{group.groupName}</h2>

      <div style={{
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
        border: "1px solid #ddd",
        fontSize: 14
      }}>
        <div style={{ marginBottom: 6 }}>
          <strong>Group ID:</strong> {group._id}
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(group._id);
            alert("Group ID copied to clipboard!");
          }}
        >
          Copy Group ID
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
    </div>
  );
}