import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPayment, confirmPayment } from "../../services/api";
import socket from "../../services/socket";

export default function PaymentPage() {
  // Interview: Payment page receives orderId and userId via router state
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;
  const userId = location.state?.userId;

  // UI states
  const [paymentData, setPaymentData] = useState(null);
  const [message, setMessage] = useState("Loading payment...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen for real-time order updates
  useEffect(() => {
    // Interview: Show error if missing required info
    if (!orderId || !userId) {
      setError("Invalid payment request. Missing order or user info.");
      setMessage("");
      return;
    }

    // Async payment initiation with loading state
    const initiatePayment = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await createPayment(orderId, userId);
        setPaymentData(data);
        setMessage("✅ Payment initiated. Please confirm.");
      } catch (err) {
        console.error(err);
        setError("❌ Failed to initiate payment.");
        setMessage("");
      } finally {
        setLoading(false);
      }
    };

    initiatePayment();

    // Real-time updates via socket
    socket.on("orderUpdate", (event) => {
      if (event.orderId === orderId) {
        if (event.event === "payment_initiated") {
          setMessage("📡 Payment initiated (real-time update).");
        }
        if (event.event === "payment_confirmed") {
          setMessage("🎉 Payment confirmed!");
          setTimeout(() => navigate("/orders"), 2000);
        }
      }
    });

    return () => {
      socket.off("orderUpdate");
    };
  }, [orderId, userId, navigate]);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await confirmPayment(orderId, paymentData.paymentId);
      setMessage("✅ Payment confirmed!");
    } catch (err) {
      console.error(err);
      setError("❌ Payment confirmation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Interview: Payment UI with error/loading states and mobile responsiveness */}
      <h2 style={styles.heading}>💳 Payment Page</h2>
      {error && <div style={styles.error}>{error}</div>}
      {loading && (
        <div style={styles.spinnerContainer}>
          <div style={styles.spinner}></div>
          <span style={{ marginLeft: 8 }}>Loading...</span>
        </div>
      )}
      {message && <p style={styles.message}>{message}</p>}

      {paymentData && (
        <div style={styles.card}>
          <p><strong>Payment ID:</strong> {paymentData.paymentId}</p>
          <p><strong>Client Secret:</strong> {paymentData.clientSecret}</p>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={styles.confirmButton}
            onMouseEnter={e => e.target.style.boxShadow = "0 2px 8px #4CAF50"}
            onMouseLeave={e => e.target.style.boxShadow = "none"}
          >
            {loading ? "Processing..." : "Confirm Payment"}
          </button>
        </div>
      )}
    </div>
  );
}

// Interview: Inline styles for polish and mobile responsiveness
const styles = {
  container: {
    padding: "20px",
    marginTop: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "60vh",
    background: "#f9f9f9",
  },
  heading: {
    marginBottom: "20px",
    fontSize: "2rem",
    color: "#333",
    textAlign: "center",
  },
  card: {
    border: "1px solid #ddd",
    padding: "20px",
    borderRadius: "12px",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 2px 8px #eee",
    background: "#fff",
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    padding: "12px 20px",
    cursor: "pointer",
    borderRadius: "6px",
    marginTop: "10px",
    fontWeight: "bold",
    transition: "box-shadow 0.2s",
    boxShadow: "none",
  },
  error: {
    color: "#d32f2f",
    background: "#ffeaea",
    padding: "10px 16px",
    borderRadius: "6px",
    marginBottom: "10px",
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
  message: {
    color: "#333",
    marginBottom: "10px",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
  spinnerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px",
    width: "100%",
    maxWidth: "400px",
  },
  spinner: {
    width: "24px",
    height: "24px",
    border: "4px solid #4CAF50",
    borderTop: "4px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "8px",
  },
};
 