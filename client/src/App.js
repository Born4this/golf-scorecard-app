import { useState, useEffect } from "react";
import CreateUser from "./pages/CreateUser";
import JoinOrCreateGroup from "./pages/JoinOrCreateGroup";
import Scorecard from "./pages/SC";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [group, setGroup] = useState(() => {
    const saved = localStorage.getItem("group");
    return saved ? JSON.parse(saved) : null;
  });

  const [scorecard, setScorecard] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const groupFromURL = params.get("group");

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (group) {
      localStorage.setItem("group", JSON.stringify(group));
    }
  }, [group]);

  useEffect(() => {
    const fetchScorecard = async () => {
      if (!group || !user) return;

      try {
        const res = await fetch(`https://golf-scorecard-app-u07h.onrender.com/api/scores/${group._id}`);
        if (res.ok) {
          const data = await res.json();
          setScorecard(data);
        } else if (res.status === 404) {
          const createRes = await fetch("https://golf-scorecard-app-u07h.onrender.com/api/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              groupId: group._id,
              users: group.users
            })
          });

          if (createRes.ok) {
            const data = await createRes.json();
            setScorecard(data);
          } else {
            console.warn("⚠️ Could not create scorecard");
          }
        } else {
          console.warn(`⚠️ Unexpected response: ${res.status}`);
        }
      } catch (err) {
        console.error("❌ Error checking/creating scorecard:", err);
      }
    };

    fetchScorecard();
  }, [group, user]);

  const handleReset = () => {
    localStorage.clear();
    setUser(null);
    setGroup(null);
    setScorecard(null);
  };

  if (!user) {
    return (
      <CreateUser
        setUser={setUser}
        groupFromURL={groupFromURL}
        setGroup={(g) => {
          setGroup(g);
          setScorecard(null); // reset scorecard for fresh user
        }}
      />
    );
  }

  if (!group) {
    return (
      <JoinOrCreateGroup
        user={user}
        setGroup={(g) => {
          setGroup(g);
          setScorecard(null); // force re-fetch
        }}
      />
    );
  }

  return (
    <>
      <div style={{ textAlign: "right", padding: "0 16px" }}>
        <button onClick={handleReset}>Reset</button>
      </div>
      <Scorecard
        user={user}
        group={group}
        scorecard={scorecard}
        setScorecard={setScorecard}
      />
    </>
  );
}

export default App;
