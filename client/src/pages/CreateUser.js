import { useState } from "react";
import axios from "axios";

export default function CreateUser({ setUser }) {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name) return alert("Enter your name");

    try {
      const res = await axios.post("http://localhost:5050/api/users", {
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
    <div style={{ padding: 20 }}>
      <h2>Enter Your Name</h2>
      <input
        type="text"
        placeholder="e.g., Mike"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: 10, fontSize: 16 }}
      />
      <button onClick={handleCreate} style={{ marginTop: 10, padding: 10 }}>
        Continue
      </button>
    </div>
  );
}
