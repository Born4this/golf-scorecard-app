import { useState } from "react";
import axios from "axios";

const API_URL = "https://golf-scorecard-app-u07h.onrender.com";

export default function CreateUser({ setUser, groupFromURL, setGroup }) {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name) return alert("Enter your name");

    try {
      const res = await axios.post(`${API_URL}/api/users`, {
        name,
        isTemporary: true
      });

      const createdUser = res.data;
      setUser(createdUser);

      if (groupFromURL) {
        const joinRes = await axios.post(`${API_URL}/api/groups/join`, {
          groupId: groupFromURL,
          userId: createdUser._id
        });

        setGroup(joinRes.data.group);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create user");
    }
  };

  return (
    <div
      style={{
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        height: "100dvh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "8vh"
      }}
    >
      <div style={{ textAlign: "center", backgroundColor: "rgba(255, 255, 255, 0.85)", padding: 20, borderRadius: 12 }}>
        <h2>Enter Your Name</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: 16,
            flexWrap: "wrap"
          }}
        >
          <input
            type="text"
            placeholder="e.g., Mike"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: 10,
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #ccc",
              width: "220px",
              maxWidth: "80vw"
            }}
          />
          <button
            onClick={handleCreate}
            style={{
              padding: "10px 16px",
              fontSize: 16,
              background: "#2f6e43",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
