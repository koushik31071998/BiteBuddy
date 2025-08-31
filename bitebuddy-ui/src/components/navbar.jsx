import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

    return (
      <div style={styles.navbarWrapper}>
        <div style={styles.navbar}>
          <h2 style={styles.logo}>🍔 <span style={{fontWeight:800}}>BiteBuddy</span></h2>
          <div style={styles.links}>
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/catalog" style={styles.link}>Catalog</Link>
            <Link to="/cart" style={styles.link}>Cart</Link>
            <Link to="/checkout" style={styles.link}>Checkout</Link>
            <Link to="/orders" style={styles.link}>Orders</Link>
            <button onClick={handleLogout} style={styles.logout}>Logout</button>
          </div>
        </div>
      </div>
    );
}

const styles = {
  navbarWrapper: {
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 100,
    background: "transparent",
    minHeight: "80px",
  },
  navbar: {
    width: "700px",
    maxWidth: "90vw",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#222",
    color: "white",
    padding: "18px 32px 18px 32px",
    borderRadius: "10px",
    boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)",
    marginTop: "32px",
    fontSize: "1.1rem",
    fontWeight: 600,
    letterSpacing: "0.5px",
  },
  logo: { margin: 0, fontSize: "1.6rem", letterSpacing: "-1px" },
  links: { display: "flex", gap: "24px", alignItems: "center", marginLeft: "32px" },
  link: { color: "white", textDecoration: "none", fontWeight: "bold", fontSize: "1.08rem", transition: "color 0.2s" },
  logout: {
    background: "linear-gradient(90deg, #ff5858 0%, #f857a6 100%)",
    color: "white",
    border: "none",
    padding: "7px 18px",
    cursor: "pointer",
    borderRadius: "5px",
    fontWeight: 700,
    fontSize: "1rem",
    marginLeft: "10px",
    boxShadow: "0 2px 8px rgba(248, 87, 166, 0.10)",
    transition: "background 0.2s, transform 0.2s",
  },
};
