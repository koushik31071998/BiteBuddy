import React from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.dashboard}>
      <h1 style={styles.heading}>Welcome to BiteBuddy Dashboard 🎉</h1>
      <button style={styles.button} onClick={handleLogout}>Logout</button>
    </div>
  );
}

const styles = {
  dashboard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#eef2f7",
  },
  heading: {
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
