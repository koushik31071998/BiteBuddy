import axios from "axios";

// ✅ Base API instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // change if backend is on different port
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

export const fetchCatalog = async () => {
  const res = await api.get("/catalog");
  console.log('Fetched catalog:', res.data);
  return res.data.items;
};

export const addCatalogItem = (formData) =>
  api.post("/catalog", formData, {
    headers: { "Content-Type": "application/json" },
  });

export default api;
