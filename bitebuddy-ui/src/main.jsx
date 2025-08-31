import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes";
import { CartProvider } from "./context/cartContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CartProvider>
      <AppRoutes />
    </CartProvider>
  </React.StrictMode>
);
