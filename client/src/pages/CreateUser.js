import { useState } from "react";
import axios from "axios";

// Hardcode the API URL
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

      setUser(res.data); // pass user object to parent
    } catch (err) {
      console.error(err);
      alert("Failed to create user");
    }
  };

  return (
    <div className="container" style={{ marginTop: "20vh", textAlign: "center" }}>
      <h2>Enter Your Name</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <input
          type="text"
          className="name-input"
          placeholder="e.g., Mike"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleCreate}>Continue</button>
      </div>
    </div>
  );
}
