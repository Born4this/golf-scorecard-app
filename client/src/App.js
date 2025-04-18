// client/src/App.js
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import CreateUser        from "./pages/CreateUser";
import JoinOrCreateGroup from "./pages/JoinOrCreateGroup";
import SelectTeam        from "./pages/SelectTeam";
import Scorecard         from "./pages/SC";
import ViewScorecard     from "./pages/ViewScorecard";
import Layout            from "./components/Format";

const API_URL = "https://golf-scorecard-app-u07h.onrender.com";

function App() {
  /* -------------------------------------------------------------------- */
  /*  State                                                                */
  /* -------------------------------------------------------------------- */
  const [user,  setUser]  = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [group, setGroup] = useState(() => {
    const saved = localStorage.getItem("group");
    return saved ? JSON.parse(saved) : null;
  });

  const [scorecard, setScorecard] = useState(null);

  /* -------------------------------------------------------------------- */
  /*  Persist user / group to localStorage                                */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    if (user)  localStorage.setItem("user",  JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (group) localStorage.setItem("group", JSON.stringify(group));
  }, [group]);

  /* -------------------------------------------------------------------- */
  /*  Keep user.team in sync after group updates                          */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    if (!group || !user) return;

    const me = group.users.find(
      (u) => u._id?.toString() === user._id
    );

    if (me?.team && me.team !== user.team) {
      setUser((prev) => ({ ...prev, team: me.team }));
    }
  }, [group, user]);

  /* -------------------------------------------------------------------- */
  /*  Fetch / create scorecard when user + group are ready                */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    const fetchScorecard = async () => {
      if (!group || !user) return;
      // ⬅️ in best‑ball, don’t fetch/create until this user has chosen a team
      if (group.gameType === "bestball" && !user.team) return;

      try {
        const res = await fetch(`${API_URL}/api/scores/${group._id}`);

        if (res.ok) {
          setScorecard(await res.json());
        } else if (res.status === 404) {
          // none yet – create a fresh one
          const createRes = await fetch(`${API_URL}/api/scores`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              groupId: group._id,
              users:   group.users.map((u) => (typeof u === "object" ? u._id : u)),
            }),
          });

          if (createRes.ok) {
            setScorecard(await createRes.json());
          } else {
            console.warn("⚠️ Could not create scorecard");
          }
        } else {
          console.warn(`⚠️ Unexpected response fetching scorecard: ${res.status}`);
        }
      } catch (err) {
        console.error("❌ Error checking/creating scorecard:", err);
      }
    };

    fetchScorecard();
  }, [group, user]);

  /* -------------------------------------------------------------------- */
  /*  Invite‑link support                                                 */
  /* -------------------------------------------------------------------- */
  const params        = new URLSearchParams(window.location.search);
  const groupFromURL  = params.get("group");

  /* -------------------------------------------------------------------- */
  /*  Routing                                                             */
  /* -------------------------------------------------------------------- */
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              {/* 1️⃣  CREATE USER */}
              {!user ? (
                <CreateUser
                  setUser={setUser}
                  groupFromURL={groupFromURL}
                  setGroup={(g) => {
                    setGroup(g);
                    setScorecard(null);
                  }}
                />
              ) : /* 2️⃣  CHOOSE / JOIN GROUP */ !group ? (
                <JoinOrCreateGroup
                  user={user}
                  setGroup={(g) => {
                    setGroup(g);
                    setScorecard(null);
                  }}
                />
              ) : /* 3️⃣  BEST BALL – CHOOSE TEAM */ group.gameType === "bestball" &&
                !user.team ? (
                <SelectTeam
                  user={user}
                  group={group}
                  setGroup={(updatedGroup) => {
                    setGroup(updatedGroup);
                    setScorecard(null);       // ⬅️ clear any old/empty scorecard
                  }}
                />
              ) : /* 4️⃣  SCORECARD */ (
                <Scorecard
                  user={user}
                  group={group}
                  scorecard={scorecard}
                  setScorecard={setScorecard}
                />
              )}
            </Layout>
          }
        />

        {/* Public / read‑only scorecard share link */}
        <Route path="/scorecard/:groupId" element={<ViewScorecard />} />
      </Routes>
    </Router>
  );
}

export default App;
