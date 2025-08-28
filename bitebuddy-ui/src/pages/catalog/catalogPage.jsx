import React, { useEffect, useState } from "react";
import { fetchCatalog } from "../../services/api";

export default function CatalogPage() {
  const [items, setItems] = useState([]);

  // Array of 20 food image URLs for variety
  const foodImages = [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=150&fit=crop", // Pizza
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=150&fit=crop", // Burger
    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&h=150&fit=crop", // Burrito
    "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=200&h=150&fit=crop", // Cake
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=150&fit=crop", // Burger
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=150&fit=crop", // Soup
    "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&h=150&fit=crop", // Salad
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=150&fit=crop", // Pancakes
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=150&fit=crop", // Tacos
    "https://images.unsplash.com/photo-1550317138-10000687a72b?w=200&h=150&fit=crop", // Pasta
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=150&fit=crop", // Sandwich
    "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=200&h=150&fit=crop", // Sushi
    "https://images.unsplash.com/photo-1534938665420-4193effeacc4?w=200&h=150&fit=crop", // Steak
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=150&fit=crop", // Ramen
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=150&fit=crop", // Salad
    "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=200&h=150&fit=crop", // Dumplings
    "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200&h=150&fit=crop", // Fried Chicken
    "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=200&h=150&fit=crop", // Ice Cream
    "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=200&h=150&fit=crop", // Coffee
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&h=150&fit=crop"  // Donut
  ];

  // Simple function to get random image
  const getRandomImage = (index) => {
    return foodImages[(index + 1) % foodImages.length];
  };

  useEffect(() => {
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>🍔 BiteBuddy Menu</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {items.map((item, index) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              width: "200px",
              padding: "10px",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={getRandomImage(index)}
              alt={item.name}
              style={{ 
                width: "100%", 
                height: "150px", 
                objectFit: "cover",
                borderRadius: "4px"
              }}
            />
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p style={{ fontWeight: "bold" }}>₹{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}