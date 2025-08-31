import React, { useState, useEffect } from "react";
import { getCart, clearCart } from "../../services/cartService";
import orderService from "../../services/orderService";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await orderService.createOrder(cart, token);
      clearCart();
      navigate("/orders");
    } catch (err) {
      alert("Error placing order: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Checkout</h2>
      <ul style={styles.list}>
        {cart.map((item, idx) => (
          <li key={idx} style={styles.item}>
            {item.name} - ${item.price} x {item.quantity}
          </li>
        ))}
      </ul>
      <button style={styles.button} onClick={handlePlaceOrder} disabled={loading}>
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
}

const styles = {
  container: { padding: "20px", marginTop: 40 },
  heading: { marginBottom: "15px" },
  list: { listStyle: "none", padding: 0, marginBottom: "20px" },
  item: { marginBottom: "10px" },
  button: { background: "blue", color: "white", border: "none", padding: "10px 20px", cursor: "pointer" },
};
