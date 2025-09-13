import React, { useState, useEffect } from "react";
import { getCart, clearCart } from "../../services/cartService";
import orderService from "../../services/orderService";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await orderService.createOrder(cart, token);
      clearCart();
      navigate("/orders");
    } catch (err) {
      setError("Error placing order: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={styles.pageBg}>
      <div style={styles.checkoutCard}>
        <h2 style={styles.heading}>🧾 Checkout</h2>
        <p style={styles.description}>
          Review your order below. Confirm the items and place your order to proceed. You will be redirected to your orders page after successful checkout.
        </p>
        {error && <div style={styles.error}>{error}</div>}
        <ul style={styles.list}>
          {cart.map((item, idx) => (
            <li key={idx} style={styles.item}>
              <span style={styles.itemText}>{item.name}</span>
              <span style={styles.priceText}>${item.price}</span> × {item.quantity}
            </li>
          ))}
        </ul>
        <div style={styles.summary}>
          <span style={styles.summaryLabel}>Total:</span>
          <span style={styles.summaryValue}>${total}</span>
        </div>
        <button
          style={styles.button}
          onClick={handlePlaceOrder}
          disabled={loading}
          onMouseEnter={e => e.target.style.background = styles.buttonHover.background}
          onMouseLeave={e => e.target.style.background = styles.button.background}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center" }}>
              <span style={styles.spinner}></span> Placing Order...
            </span>
          ) : (
            "✅ Place Order"
          )}
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageBg: {
    minHeight: "100vh",
    background: "linear-gradient(120deg, #f8fafc 0%, #e9ecef 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "32px 8px",
  },
  checkoutCard: {
    background: "#fff",
    borderRadius: "18px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13)",
    padding: "38px 32px 32px 32px",
    maxWidth: "480px",
    width: "100%",
    margin: "40px auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    animation: "fadeIn 0.7s cubic-bezier(.4,0,.2,1)",
  },
  heading: {
    marginBottom: "12px",
    fontSize: "2rem",
    color: "#22223b",
    fontWeight: 800,
    letterSpacing: "-1px",
    textShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  description: {
    marginBottom: "18px",
    fontSize: "1.08rem",
    color: "#6c757d",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  error: {
    color: "#d32f2f",
    background: "#ffeaea",
    padding: "10px 16px",
    borderRadius: "6px",
    marginBottom: "10px",
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
  },
  list: {
    listStyle: "none",
    padding: 0,
    width: "100%",
    marginBottom: "18px",
  },
  item: {
    marginBottom: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8fafc",
    borderRadius: "8px",
    padding: "10px 14px",
    boxShadow: "0 2px 8px rgba(31,38,135,0.07)",
  },
  itemText: {
    fontSize: "1.08rem",
    color: "#22223b",
    fontWeight: 500,
  },
  priceText: {
    color: "#007bff",
    fontWeight: 700,
    marginLeft: "4px",
  },
  summary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    margin: "18px 0 10px 0",
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#22223b",
  },
  summaryLabel: {
    fontWeight: 700,
    color: "#22223b",
  },
  summaryValue: {
    color: "#007bff",
    fontWeight: 700,
    marginLeft: "8px",
  },
  button: {
    background: "#28a745",
    color: "white",
    padding: "12px 28px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "1.08rem",
    boxShadow: "0 2px 8px rgba(40,167,69,0.10)",
    transition: "background 0.2s, transform 0.2s",
    outline: "none",
    marginTop: "8px",
  },
  buttonHover: {
    background: "#218838",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid #007bff",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "8px",
    display: "inline-block",
  },
};

// Add fadeIn and spinner animation to the page
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `@keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }\n@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
if (!document.head.querySelector('style[data-checkout-fadein]')) {
  styleSheet.setAttribute('data-checkout-fadein', 'true');
  document.head.appendChild(styleSheet);
}
