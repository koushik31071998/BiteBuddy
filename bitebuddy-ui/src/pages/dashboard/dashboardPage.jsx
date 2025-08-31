import React from "react";
import { useNavigate } from "react-router-dom";
// ...existing code...

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleExplore = () => { 
    navigate("/catalog");
  };

  return (
    <div style={styles.dashboard}>
      <div style={{...styles.card, marginTop: 0}}>
        <h1 style={styles.heading}>Welcome to BiteBuddy Dashboard <span role="img" aria-label="party">🎉</span></h1>
        <p style={styles.subtext}>Select options from the menu above to explore.</p>
        <button
          style={isHovered ? { ...styles.button, ...styles.buttonHover } : styles.button}
          onClick={handleExplore}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Explore
        </button>
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(120deg, #f8fafc 0%, #e9ecef 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "32px 8px",
    textAlign: "center",
    transition: "background 0.5s cubic-bezier(.4,0,.2,1)",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
    padding: "48px 36px 36px 36px",
    maxWidth: "420px",
    width: "100%",
    marginTop: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "fadeIn 0.7s cubic-bezier(.4,0,.2,1)",
  },
  heading: {
    marginBottom: "18px",
    fontSize: "2.3rem",
    color: "#22223b",
    fontWeight: 800,
    letterSpacing: "-1px",
    textShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  subtext: {
    marginBottom: "32px",
    fontSize: "1.15rem",
    color: "#6c757d",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  button: {
    padding: "14px 36px",
    background: "linear-gradient(90deg, #ff5858 0%, #f857a6 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: 700,
    boxShadow: "0 4px 16px rgba(248, 87, 166, 0.15)",
    transition: "background 0.3s, transform 0.2s, box-shadow 0.2s",
    outline: "none",
  },
  buttonHover: {
    background: "linear-gradient(90deg, #f857a6 0%, #ff5858 100%)",
    transform: "scale(1.04)",
    boxShadow: "0 8px 24px rgba(248, 87, 166, 0.18)",
  },
};

// Add fadeIn animation to the page
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `@keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`;
if (!document.head.querySelector('style[data-dashboard-fadein]')) {
  styleSheet.setAttribute('data-dashboard-fadein', 'true');
  document.head.appendChild(styleSheet);
}

