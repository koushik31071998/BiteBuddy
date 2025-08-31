import React, { useContext } from "react";
import { CartContext } from "../../context/cartContext";
import { placeOrder } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {    
    try {
      const items = cart.map((c) => ({
        catalogItem: c._id,
        quantity: c.quantity,
      }));
      await placeOrder(items);
      alert("✅ Order placed successfully!");
      clearCart();
      navigate("/orders");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to place order");
    }
  };

  return (
    <div style={styles.container}>
      <h2>🛒 Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={styles.list}>
            {cart.map((item) => (
              <li key={item._id} style={styles.item}>
                <span>
                  {item.name} - ₹{item.price} × {item.quantity}
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
              Total: ₹
              {cart.reduce((sum, it) => sum + it.price * it.quantity, 0)}
            </strong>
          </p>
          <button onClick={handlePlaceOrder} style={styles.orderButton}>
            ✅ Place Order
          </button>
        </>
      )}
    </div>
  );
}

// ✅ Styles in same file
const styles = {
  container: {
    padding: "20px",
    marginTop: "40px",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  item: {
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  removeButton: {
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  total: {
    fontSize: "18px",
    margin: "20px 0",
  },
  orderButton: {
    background: "green",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
