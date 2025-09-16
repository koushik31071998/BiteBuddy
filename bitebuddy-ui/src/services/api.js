import axios from "axios";

// ✅ Base API instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // adjust if backend runs elsewhere
});

// ✅ Add token automatically to every request if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------
// AUTH ENDPOINTS
// ----------------------
export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (name, email, password) => {
  const res = await api.post("/auth/register", { name, email, password });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

// ----------------------
// CATALOG ENDPOINTS
// ----------------------
export const fetchCatalog = async () => {
  const res = await api.get("/catalog?limit=30&offset=0");
  console.log("Fetched catalog:", res.data);
  return res.data.items;
};

export const addCatalogItem = (formData) =>
  api.post("/catalog", formData, {
    headers: { "Content-Type": "application/json" },
  });

// ----------------------
// ORDER ENDPOINTS
// ----------------------

// ✅ Place a new order
export const placeOrder = async (items) => {
  const res = await api.post("/orders", { items });
  return res.data;
};

// ✅ Get logged-in user's orders
export const fetchMyOrders = async () => {
  const res = await api.get("/orders");
  return res.data;
};

// ✅ Cancel an order (user only)
export const cancelOrder = async (orderId) => {
  const res = await api.post(`/orders/${orderId}/cancel`);
  return res.data;
};

// ✅ Update order status (admin only)
export const updateOrderStatus = async (orderId, status) => {
  const res = await api.patch(`/orders/${orderId}`, { status });
  return res.data;
};

// ----------------------
// PAYMENTS ENDPOINTS (Mock)
// ----------------------
export const createPayment = async (orderId, userId) => {
  const res = await api.post(`/payments/create`, { orderId, userId });
  return res.data; // { paymentId, clientSecret }
};

export const confirmPayment = async (orderId, paymentId) => {
  const res = await api.post(`/payments/confirm`, { orderId, paymentId });
  return res.data; // { success, order }
};


export default api;
