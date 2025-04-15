import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = "https://golf-scorecard-app-u07h.onrender.com";

export default function ViewScorecard() {
  const { groupId } = useParams();
  const [scorecard, setScorecard] = useState(null);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/scores/${groupId}`);
        if (res.status === 200) {
          setScorecard(res.data);
        }
      } catch (err) {
        console.error("Error fetching scorecard:", err);
      }
    };

    const fetchUserNames = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/groups/${groupId}`);
        if (res.status === 200 && res.data.users) {
          const nameMap = {};
          res.data.users.forEach((u) => (nameMap[u._id] = u.name));
          setUserNames(nameMap);
        }
      } catch (err) {
        console.error("Error fetching user names:", err);
      }
    };

    fetchScorecard();
    fetchUserNames();
  }, [groupId]);

  if (!scorecard) return <p>Loading scorecard...</p>;

  return (
    <div className="container">
      <h2 className="scorecard-heading">Final Scores</h2>
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Hole</th>
            {Object.keys(scorecard.scores).map((uid) => (
              <th key={uid}>{userNames[uid] || "Player"}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(18)].map((_, holeIndex) => (
            <tr key={holeIndex}>
              <td>H{holeIndex + 1}</td>
              {Object.values(scorecard.scores).map((scores, idx) => (
                <td key={idx}>{scores[holeIndex]}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            {Object.values(scorecard.scores).map((scores, idx) => (
              <td key={idx}>{scores.reduce((sum, s) => sum + s, 0)}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
