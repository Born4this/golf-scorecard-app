import { useState } from "react";
import axios from "axios";

// Hardcoded API URL
const API_URL = "https://golf-scorecard-app-u07h.onrender.com";

export default function CreateUser({ setUser }) {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name) return alert("Enter your name");

    try {
      const res = await axios.post(`${API_URL}/api/users`, {
        name,
        isTemporary: true
      });

      setUser(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to create user");
    }
  };

  return (
    <div style={{ paddingTop: "25vh", textAlign: "center" }}>
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
  );
}
