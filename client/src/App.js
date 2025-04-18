import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateUser from "./pages/CreateUser";
import JoinOrCreateGroup from "./pages/JoinOrCreateGroup";
import Scorecard from "./pages/SC";
import ViewScorecard from "./pages/ViewScorecard";
import SelectTeam from "./pages/SelectTeam";
import Layout from "./components/Format";

function App() {
  /* ---------- state ---------- */
  const [user,  setUser]  = useState(() => JSON.parse(localStorage.getItem("user"))  || null);
  const [group, setGroup] = useState(() => JSON.parse(localStorage.getItem("group")) || null);
  const [scorecard, setScorecard] = useState(null);

  /* ---------- persist to localStorage ---------- */
  useEffect(() => {
    if (user)  localStorage.setItem("user",  JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (group) localStorage.setItem("group", JSON.stringify(group));
  }, [group]);

  /* ---------- (re)load / create scorecard ---------- */
  useEffect(() => {
    const loadScorecard = async () => {
      if (!group || !user) return;

      const base = "https://golf-scorecard-app-u07h.onrender.com/api/scores";

      try {
        const res = await fetch(`${base}/${group._id}`);

        if (res.ok) {
          setScorecard(await res.json());
          return;
        }

        if (res.status === 404) {
          /* create it – ONLY ids, no objects! */
          const userIds = group.users.map((u) =>
            typeof u === "object" ? u._id : u
          );

          const create = await fetch(base, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId: group._id, users: userIds }),
          });

          if (create.ok) {
            setScorecard(await create.json());
          } else {
            console.warn("⚠️ Could not create scorecard");
          }
        }
      } catch (err) {
        console.error("❌ Scorecard fetch/create failed:", err);
      }
    };

    loadScorecard();
  }, [group, user]);

  /* ---------- helper for invite‑link flow ---------- */
  const params       = new URLSearchParams(window.location.search);
  const groupFromURL = params.get("group");

  /* ---------- routes ---------- */
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
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
              ) : group.gameType === "bestball" &&
                !user.team &&
                group.users.length > 1 ? (
                <SelectTeam
                  user={user}
                  setUser={setUser}     /* update user with team */
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
        <Route path="/scorecard/:groupId" element={<ViewScorecard />} />
      </Routes>
    </Router>
  );
}

export default App;
