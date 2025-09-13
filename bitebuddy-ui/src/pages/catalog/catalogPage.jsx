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
        console.log("Fetched catalog items:", data);
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

  // Interactive hover state for cards
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🍔 BiteBuddy Menu</h2>

      <button onClick={() => navigate("/cart")} style={styles.cartButton}>
        🛒 Go to Cart
      </button>

      <div style={styles.grid}>
        {items.map((item, index) => (
          <div
            key={item._id}
            style={hoveredIdx === index ? { ...styles.card, ...styles.cardHover } : styles.card}
            onMouseEnter={() => setHoveredIdx(index)}
            onMouseLeave={() => setHoveredIdx(null)}
            tabIndex={0}
            aria-label={item.name}
          >
            <img
              src={getRandomImage(index)}
              alt={item.name}
              style={styles.image}
            />
            <h3 style={styles.itemName}>{item.name}</h3>
            <p style={styles.itemDesc}>{item.description}</p>
            <p style={styles.price}>${item.price}</p>
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
    minHeight: "100vh",
    background: "linear-gradient(120deg, #f8fafc 0%, #e9ecef 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  heading: {
    marginBottom: "18px",
    fontSize: "2rem",
    color: "#22223b",
    fontWeight: 800,
    letterSpacing: "-1px",
    textShadow: "0 2px 8px rgba(0,0,0,0.04)",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "40px",
    marginTop: "32px",
    width: "100%",
    maxWidth: "1200px",
    justifyItems: "center",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1.5px solid #e5e7eb",
    borderRadius: "25px",
    width: "95%",
    minWidth: "240px",
    maxWidth: "320px",
    minHeight: "370px",
    background: "#fff",
    padding: "24px 20px 20px 20px",
    textAlign: "center",
    boxShadow: "0 4px 18px 0 rgba(31, 38, 135, 0.08)",
    transition: "box-shadow 0.2s, transform 0.2s, background 0.2s",
    position: "relative",
    animation: "fadeIn 0.7s cubic-bezier(.4,0,.2,1)",
  },
  cardHover: {
    boxShadow: "0 8px 32px rgba(0,123,255,0.18)",
    background: "linear-gradient(90deg, #e3f2fd 0%, #fff 100%)",
    transform: "scale(1.04)",
  },
  image: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "10px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    transition: "transform 0.2s",
  },
  itemName: {
    fontWeight: 700,
    fontSize: "1.15rem",
    marginBottom: "6px",
    letterSpacing: "-0.5px",
    color: "#22223b",
  },
  itemDesc: {
    fontSize: "0.98rem",
    color: "#6c757d",
    textAlign: "center",
    marginBottom: "0",
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
    marginTop: "10px",
  },
};

