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
  const [user,  setUser]  = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [group, setGroup] = useState(() => {
    const saved = localStorage.getItem("group");
    return saved ? JSON.parse(saved) : null;
  });
  const [scorecard, setScorecard] = useState(null);

  useEffect(() => {
    if (user)  localStorage.setItem("user",  JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (group) localStorage.setItem("group", JSON.stringify(group));
  }, [group]);

  // keep user.team in sync if group.users changes
  useEffect(() => {
    if (!group || !user) return;
    const me = group.users.find((u) => u._id?.toString() === user._id);
    if (me?.team && me.team !== user.team) {
      setUser((u) => ({ ...u, team: me.team }));
    }
  }, [group, user]);

  // fetch or create the scorecard once we have both user+group
  useEffect(() => {
    if (!user || !group) return;
    const fn = async () => {
      try {
        const res = await fetch(`${API_URL}/api/scores/${group._id}`);
        if (res.ok) {
          setScorecard(await res.json());
        } else if (res.status === 404) {
          const createRes = await fetch(`${API_URL}/api/scores`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              groupId: group._id,
              users: group.users.map((u) => (typeof u === "object" ? u._id : u)),
            }),
          });
          if (createRes.ok) setScorecard(await createRes.json());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fn();
  }, [user, group]);

  // parse ?group=… invite‐link
  const params       = new URLSearchParams(window.location.search);
  const groupFromURL = params.get("group");

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              {/*
                1️⃣ If we don’t have a user yet → CreateUser
                2️⃣ Else if we have a user but no group → JoinOrCreateGroup
                3️⃣ Else if this is Best‑Ball AND this user has no team → SelectTeam
                4️⃣ Otherwise → Show the live Scorecard
              */}
              {!user ? (
                <CreateUser
                  setUser={setUser}
                  groupFromURL={groupFromURL}
                  setGroup={(g) => {
                    setGroup(g);
                    setScorecard(null);
                  }}
                />
              ) : !group ? (
                <JoinOrCreateGroup
                  user={user}
                  setGroup={(g) => {
                    setGroup(g);
                    setScorecard(null);
                  }}
                />
              ) : group.gameType === "bestball" && !user.team ? (
                <SelectTeam
                  user={user}
                  group={group}
                  setGroup={setGroup}
                />
              ) : (
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

        {/* public read‑only share link */}
        <Route path="/scorecard/:groupId" element={<ViewScorecard />} />
      </Routes>
    </Router>
  );
}

export default App;
