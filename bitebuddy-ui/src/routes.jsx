import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/loginPage";
import RegisterPage from "./pages/auth/registerPage";
import DashboardPage from "./pages/dashboard/dashBoardPage";
import CatalogPage from "./pages/catalog/catalogPage";
import AddCatalogPage from "./pages/catalog/addCatalogPage";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

export default function AppRoutes() {
  return (
    <>
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route
          path="/catalog"
          element={
            <PrivateRoute>
              <CatalogPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/catalog/add"
          element={
            <PrivateRoute>
              <AddCatalogPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    </>

  );
}
