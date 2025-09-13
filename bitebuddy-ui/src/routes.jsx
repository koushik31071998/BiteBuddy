import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/auth/loginPage";
import RegisterPage from "./pages/auth/registerPage";
import DashboardPage from "./pages/dashboard/dashboardPage";
import CatalogPage from "./pages/catalog/catalogPage";
import CartPage from "./pages/cartPage/cartPage";
import CheckoutPage from "./pages/checkoutPage/checkoutPage";
import OrdersPage from "./pages/ordersPage/ordersPage";
import NavBar from "./components/navbar";
import PaymentPage from "./pages/payments/paymentsPage";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};


// Layout with NavBar for all main pages
function MainLayout({ children }) {
  return (
    <>
      <NavBar />
      <div style={{ paddingTop: 110 }}>{children}</div>
    </>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {/* <MainLayout> */}
                <DashboardPage />
              {/* </MainLayout> */}
            </PrivateRoute>
          }
        />
        <Route
          path="/catalog"
          element={
            <PrivateRoute>
              <MainLayout>
                <CatalogPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <MainLayout>
                <CartPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <MainLayout>
                <CheckoutPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <MainLayout>
                <OrdersPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <PrivateRoute>
              <MainLayout>
                <PaymentPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
