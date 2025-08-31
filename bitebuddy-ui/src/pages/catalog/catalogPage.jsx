import React, { useEffect, useState, useContext } from "react";
import { fetchCatalog } from "../../services/api";
import { CartContext } from "../../context/cartContext"
import { useNavigate } from "react-router-dom";

export default function CatalogPage() {
  const [items, setItems] = useState([]);
  const { cart, addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Food image URLs
  const foodImages = [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1550317138-10000687a72b?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1534938665420-4193effeacc4?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=200&h=150&fit=crop",
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&h=150&fit=crop",
  ];

  const getRandomImage = (index) => foodImages[(index + 1) % foodImages.length];

  useEffect(() => {
    console.log("Current cart items:", cart);
    const loadCatalog = async () => {
      try {
        const data = await fetchCatalog();
        setItems(data);
      } catch (err) {
        console.error("Failed to load catalog", err);
      }
    };
    loadCatalog();
  }, []);

  function handleAddToCart(item){
    addToCart(item);
  }

  return (
    <div style={styles.container}>
      <h2>🍔 BiteBuddy Menu</h2>

      <button onClick={() => navigate("/cart")} style={styles.cartButton}>
        🛒 Go to Cart
      </button>

      <div style={styles.grid}>
        {items.map((item, index) => (
          <div key={item._id} style={styles.card}>
            <img
              src={getRandomImage(index)}
              alt={item.name}
              style={styles.image}
            />
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p style={styles.price}>₹{item.price}</p>
            {cart.some((cartItem) => cartItem._id === item._id) ? (
              <p style={styles.addedMessage}>✔️ Added to Cart</p>
            ) : (
              <button onClick={() => handleAddToCart(item)} style={styles.addButton}>
                ➕ Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ✅ Styles kept in same file
const styles = {
  container: {
    padding: "20px",
    marginTop: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "28px",
    marginTop: "32px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1.5px solid #e5e7eb",
    borderRadius: "14px",
    width: "100%",
    minWidth: "240px",
    maxWidth: "320px",
    minHeight: "370px",
    background: "#fff",
    padding: "20px 18px 18px 18px",
    textAlign: "center",
    boxShadow: "0 4px 18px 0 rgba(31, 38, 135, 0.08)",
    transition: "box-shadow 0.2s, transform 0.2s",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  price: {
    fontWeight: "bold",
    fontSize: "1.1rem",
    color: "#22223b",
    margin: "10px 0 18px 0",
  },
  addButton: {
    marginTop: "auto",
    width: "100%",
    padding: "12px 0",
    background: "linear-gradient(90deg, #007bff 0%, #00c6ff 100%)",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "1rem",
    boxShadow: "0 2px 8px rgba(0,123,255,0.10)",
    transition: "background 0.2s, transform 0.2s",
    outline: "none",
  },
  cartButton: {
    marginBottom: "10px",
    padding: "10px 22px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    boxShadow: "0 2px 8px rgba(40,167,69,0.10)",
    transition: "background 0.2s, transform 0.2s",
  },
  addedMessage: {
    color: "green",
    fontWeight: "bold",
  },
};
