import React, { useContext, useState } from "react";
import { CartContext } from "../../context/cartContext";
import { placeOrder, fetchMyOrders } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = cart.map((c) => ({
        catalogItem: c._id,
        quantity: c.quantity,
      }));
      await placeOrder(items);
      clearCart();
      const data = await fetchMyOrders();
      if (data.items && data.items.length > 0) {
        navigate("/payment", { state: { orderId: data.items[0]._id, userId: data.items[0].user } });
      } else {
        setError("No orders found after placing order.");
      }
    } catch (err) {
      setError("❌ Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageBg}>
      <div style={styles.cartCard}>
        <h2 style={styles.heading}>🛒 Your Cart</h2>
        <p style={styles.description}>
          Review your selected items below. You can remove items or proceed to place your order. Once you place your order, you'll be redirected to payment.
        </p>
        {error && <div style={styles.error}>{error}</div>}
        {cart.length === 0 ? (
          <p style={styles.empty}>Your cart is empty.</p>
        ) : (
          <>
            <ul style={styles.list}>
              {cart.map((item) => (
                <li key={item._id} style={styles.item}>
                  <span style={styles.itemText}>
                    {item.name} <span style={styles.priceText}>- ${item.price}</span> × {item.quantity}
                  </span>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    style={styles.removeButton}
                  >
                    ❌ Remove
                  </button>
                </li>
              ))}
            </ul>
            <p style={styles.total}>
              <strong>
                Total: ${cart.reduce((sum, it) => sum + it.price * it.quantity, 0)}
              </strong>
            </p>
            <button
              onClick={handlePlaceOrder}
              style={styles.orderButton}
              disabled={loading}
              onMouseEnter={e => e.target.style.background = styles.orderButtonHover.background}
              onMouseLeave={e => e.target.style.background = styles.orderButton.background}
            >
              {loading ? "Processing..." : "✅ Place Order"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ✅ Styles in same file
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
  cartCard: {
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
  empty: {
    color: "#888",
    fontSize: "1.1rem",
    marginTop: "18px",
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
  removeButton: {
    background: "#ff3b3b",
    color: "white",
    border: "none",
    borderRadius: "7px",
    padding: "7px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    boxShadow: "0 2px 8px rgba(255,59,59,0.10)",
    transition: "background 0.2s, transform 0.2s",
    outline: "none",
  },
  total: {
    fontSize: "1.18rem",
    margin: "20px 0 18px 0",
    color: "#22223b",
    fontWeight: 700,
    textAlign: "left",
  },
  orderButton: {
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
  orderButtonHover: {
    background: "#218838",
  },
};


