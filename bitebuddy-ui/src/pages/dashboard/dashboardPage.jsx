import React from "react";
import { useNavigate } from "react-router-dom";
// ...existing code...

export default function DashboardPage() {
  // Interview: Dashboard is the main entry point, show quick links and polish
  const navigate = useNavigate();
  const [hovered, setHovered] = React.useState(null);

  // Feature cards for quick navigation
  const features = [
    {
      label: "Catalog",
      icon: "📦",
      desc: "Browse and manage food items.",
      to: "/catalog",
    },
    {
      label: "Cart",
      icon: "🛒",
      desc: "View and edit your cart.",
      to: "/cart",
    },
    {
      label: "Orders",
      icon: "📑",
      desc: "Track your orders and status.",
      to: "/orders",
    },
    {
      label: "Checkout",
      icon: "💳",
      desc: "Complete your purchase.",
      to: "/checkout",
    },
  ];

  return (
    <div style={styles.dashboard}>
      <div style={styles.headerCard}>
        <h1 style={styles.heading}>
          <span style={styles.logoIcon} aria-label="burger" role="img">🍔</span>
          Welcome to BiteBuddy Dashboard <span role="img" aria-label="party">🎉</span>
        </h1>
        <p style={styles.subtext}>Select an option below to get started.</p>
      </div>
      <div style={styles.grid}>
        {features.map((f, idx) => (
          <button
            key={f.label}
            style={hovered === idx ? { ...styles.card, ...styles.cardHover } : styles.card}
            onClick={() => navigate(f.to)}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
            tabIndex={0}
            aria-label={f.label}
          >
            <span style={styles.cardIcon} role="img" aria-label={f.label}>{f.icon}</span>
            <span style={styles.cardTitle}>{f.label}</span>
            <span style={styles.cardDesc}>{f.desc}</span>
          </button>
        ))}
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
    justifyContent: "flex-start",
    background: "linear-gradient(120deg, #f8fafc 0%, #e9ecef 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "32px 8px 0 8px",
    textAlign: "center",
    transition: "background 0.5s cubic-bezier(.4,0,.2,1)",
  },
  headerCard: {
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
    padding: "36px 24px 24px 24px",
    maxWidth: "420px",
    width: "100%",
    margin: "40px auto 24px auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "fadeIn 0.7s cubic-bezier(.4,0,.2,1)",
  },
  logoIcon: {
    fontSize: "2.2rem",
    marginRight: "8px",
    verticalAlign: "middle",
    filter: "drop-shadow(0 2px 8px #ff5858a0)",
    animation: "popIn 0.7s cubic-bezier(.4,0,.2,1)",
  },
  heading: {
    marginBottom: "12px",
    fontSize: "2.1rem",
    color: "#22223b",
    fontWeight: 800,
    letterSpacing: "-1px",
    textShadow: "0 2px 8px rgba(0,0,0,0.04)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  subtext: {
    marginBottom: "18px",
    fontSize: "1.1rem",
    color: "#6c757d",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "24px",
    width: "100%",
    maxWidth: "700px",
    margin: "0 auto",
    marginBottom: "32px",
    justifyItems: "center",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 16px 0 rgba(31, 38, 135, 0.10)",
    padding: "28px 18px 18px 18px",
    minWidth: "160px",
    width: "100%",
    maxWidth: "220px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "box-shadow 0.2s, transform 0.2s, background 0.2s",
    outline: "none",
    border: "none",
    fontSize: "1rem",
    margin: 0,
    marginTop: 0,
    animation: "fadeIn 0.7s cubic-bezier(.4,0,.2,1)",
  },
  cardHover: {
    boxShadow: "0 8px 32px rgba(248, 87, 166, 0.18)",
    background: "linear-gradient(90deg, #f857a6 0%, #ff5858 100%)",
    color: "#fff",
    transform: "scale(1.04)",
  },
  cardIcon: {
    fontSize: "2.1rem",
    marginBottom: "10px",
    filter: "drop-shadow(0 2px 8px #f857a6a0)",
    transition: "transform 0.2s",
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: "1.15rem",
    marginBottom: "6px",
    letterSpacing: "-0.5px",
  },
  cardDesc: {
    fontSize: "0.98rem",
    color: "#6c757d",
    textAlign: "center",
    marginBottom: "0",
  },
  loading: {
    color: "#f857a6",
    fontWeight: "bold",
    marginTop: "24px",
  },
  error: {
    color: "#d32f2f",
    background: "#ffeaea",
    padding: "10px 16px",
    borderRadius: "6px",
    marginTop: "24px",
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
};
 

