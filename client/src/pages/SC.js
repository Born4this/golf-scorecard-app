import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// Connect to your backend Socket.io server
const socket = io("http://localhost:5050");

export default function Scorecard({ user, group, scorecard, setScorecard }) {
  const [userNames, setUserNames] = useState({});

  // Join the Socket.io room for this group
  useEffect(() => {
    socket.emit("joinGroup", group._id);

    socket.on("scorecardUpdated", (updated) => {
      setScorecard(updated);
    });

    return () => {
      socket.off("scorecardUpdated");
    };
  }, [group._id, setScorecard]);

  // Fetch user names when scorecard loads
  useEffect(() => {
    const fetchUserNames = async () => {
      if (!scorecard || !scorecard.scores) return;

      const userIds = Object.keys(scorecard.scores);

      try {
        const res = await axios.post("http://localhost:5050/api/users/names", {
          userIds
        });

        if (res.status === 200) {
          setUserNames(res.data); // { userId1: "Mike", userId2: "Alex" }
        }
      } catch (err) {
        console.error("❌ Error fetching user names:", err);
      }
    };

    fetchUserNames();
  }, [scorecard]);

  if (!scorecard) return <p>Loading scorecard...</p>;

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
                        axios.patch("http://localhost:5050/api/scores/update", {
                          groupId: group._id,
                          userId: user._id,
                          holeIndex,
                          strokes: Number(e.target.value)
                        })
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
