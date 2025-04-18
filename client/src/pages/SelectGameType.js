import { useNavigate } from "react-router-dom";
import "../scorecard-style-additions.css";

export default function SelectGameType() {
  const navigate = useNavigate();

  const handleSelection = (type) => {
    localStorage.setItem("gameType", type);
    navigate("/join-or-create-group");
  };

  return (
    <div
      className="container"
      style={{
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 20,
      }}
    >
      <h2 style={{ fontSize: "2rem", marginBottom: 30, color: "white", textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}>
        Choose Game Type
      </h2>
      <div style={{ display: "flex", gap: 20 }}>
        <button
          onClick={() => handleSelection("standard")}
          style={{
            padding: "12px 24px",
            fontSize: 16,
            borderRadius: 10,
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          Standard
        </button>
        <button
          onClick={() => handleSelection("bestball")}
          style={{
            padding: "12px 24px",
            fontSize: 16,
            borderRadius: 10,
            border: "none",
            backgroundColor: "#28a745",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          Best Ball
        </button>
      </div>
    </div>
  );
}
