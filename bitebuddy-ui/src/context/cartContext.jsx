import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add item to cart
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((p) => p._id === item._id);
      if (existing) {
        return prev.map((p) =>
          p._id === item._id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  // Update quantity
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) return removeFromCart(id);
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => setCart([]);

  // Compute total
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  return(
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};
