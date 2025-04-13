import { useState, useEffect } from "react";
import CreateUser from "./pages/CreateUser";
import JoinOrCreateGroup from "./pages/JoinOrCreateGroup";
import Scorecard from "./pages/SC"; // or "./pages/Scorecard" depending on what you stuck with

function App() {
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [scorecard, setScorecard] = useState(null);

  useEffect(() => {
    const fetchScorecard = async () => {
      if (!group || !user) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/scores/${group._id}`);

        if (res.ok) {
          const data = await res.json();
          setScorecard(data);
        } else if (res.status === 404) {
          // Scorecard doesn't exist — create it
          const createRes = await fetch(`${import.meta.env.VITE_API_URL}/api/scores`, {
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

  if (!user) return <CreateUser setUser={setUser} />;
  if (!group) {
    return (
      <JoinOrCreateGroup
        user={user}
        setGroup={(g) => {
          setGroup(g);
          setScorecard(null); // force re-fetch when a new group is set
        }}
      />
    );
  }

  return (
    <Scorecard
      user={user}
      group={group}
      scorecard={scorecard}
      setScorecard={setScorecard}
    />
  );
}

export default App;
