import React, { useEffect, useState } from "react";
import { fetchMyOrders, cancelOrder } from "../../services/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyOrders();
      setOrders(data.items);
    } catch (err) {
      setError("Failed to fetch orders. Please try again.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancel = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      await cancelOrder(orderId);
      loadOrders();
    } catch (err) {
      setError("❌ Failed to cancel order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageBg}>
      <div style={styles.ordersCard}>
        <h2 style={styles.heading}>📦 My Orders</h2>
        <p style={styles.description}>
          Here are your recent orders. You can view status, details, and cancel pending orders below.
        </p>
        {error && <div style={styles.error}>{error}</div>}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <span style={{ marginLeft: 8 }}>Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <p style={styles.empty}>No orders found.</p>
        ) : (
          <div style={styles.list}>
            {orders.map((order) => (
              <div key={order._id} style={styles.card}>
                <h3 style={styles.orderId}>Order <span style={styles.orderHash}>#{order._id}</span></h3>
                <p style={styles.statusRow}>
                  Status: {order.status === "pending" ? (
                    <span style={{ ...styles.status, ...styles.statusPending }}>
                      ⏳ Pending
                    </span>
                  ) : order.status === "confirmed" ? (
                    <span style={{ ...styles.status, ...styles.statusConfirmed }}>
                      ✅ Confirmed
                    </span>
                  ) : (
                    <span style={{ ...styles.status, ...styles.statusCancelled }}>
                      ❌ Cancelled
                    </span>
                  )}
                </p>
                <p style={styles.total}>Total: ${order.totalPrice}</p>
                <ul style={styles.items}>
                  {order.items.map((i, idx) => (
                    <li key={idx} style={styles.itemRow}>
                      {i.name} - {i.quantity} × ${i.price}
                    </li>
                  ))}
                </ul>
                {order.status === "pending" && (
                  <button
                    style={styles.cancelButton}
                    onClick={() => handleCancel(order._id)}
                    disabled={loading}
                    onMouseEnter={e => e.target.style.background = styles.cancelButtonHover.background}
                    onMouseLeave={e => e.target.style.background = styles.cancelButton.background}
                  >
                    ❌ Cancel Order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Styles in the same file
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
  ordersCard: {
    background: "#fff",
    borderRadius: "18px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13)",
    padding: "38px 32px 32px 32px",
    maxWidth: "750px",
    width: "100%",
    margin: "40px auto 40px auto",
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
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "32px",
    width: "100%",
    minHeight: "60px",
  },
  spinner: {
    width: "24px",
    height: "24px",
    border: "4px solid #007bff",
    borderTop: "4px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "8px",
  },
  empty: {
    color: "#888",
    fontSize: "1.1rem",
    marginTop: "18px",
    textAlign: "center",
    width: "100%",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    width: "100%",
    marginTop: "8px",
  },
  card: {
    border: "1.5px solid #e5e7eb",
    borderRadius: "14px",
    background: "#f8fafc",
    boxShadow: "0 4px 18px 0 rgba(31, 38, 135, 0.08)",
    padding: "24px 20px 20px 20px",
    width: "100%",
    minWidth: "240px",
    maxWidth: "95%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    animation: "fadeIn 0.7s cubic-bezier(.4,0,.2,1)",
  },
  orderId: {
    fontWeight: 700,
    fontSize: "1.15rem",
    marginBottom: "6px",
    letterSpacing: "-0.5px",
    color: "#22223b",
  },
  orderHash: {
    color: "#007bff",
    fontWeight: 700,
    marginLeft: "4px",
    fontSize: "1rem",
    wordBreak: "break-all",
  },
  statusRow: {
    marginBottom: "8px",
    fontSize: "1.08rem",
    fontWeight: 500,
  },
  status: {
    fontWeight: "bold",
    padding: "2px 10px",
    borderRadius: "6px",
    fontSize: "1rem",
    marginLeft: "8px",
    display: "inline-block",
  },
  statusPending: {
    background: "#fff3cd",
    color: "#856404",
    border: "1px solid #ffeeba",
  },
  statusConfirmed: {
    background: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  statusCancelled: {
    background: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
  total: {
    fontWeight: "bold",
    fontSize: "1.08rem",
    color: "#22223b",
    margin: "10px 0 10px 0",
  },
  items: {
    listStyle: "none",
    paddingLeft: 0,
    marginTop: "10px",
    width: "100%",
  },
  itemRow: {
    fontSize: "1rem",
    color: "#22223b",
    marginBottom: "4px",
  },
  cancelButton: {
    marginTop: "10px",
    background: "#ff3b3b",
    color: "white",
    border: "none",
    borderRadius: "7px",
    padding: "9px 18px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    boxShadow: "0 2px 8px rgba(255,59,59,0.10)",
    transition: "background 0.2s, transform 0.2s",
    outline: "none",
  },
  cancelButtonHover: {
    background: "#c82333",
  },
};

