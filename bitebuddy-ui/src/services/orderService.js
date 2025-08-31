import axios from "axios";

const API_URL = "http://localhost:4000/api/orders";

const orderService = {
  createOrder: async (cart, token) => {
    const items = cart.map((c) => ({
      catalogItem: c.catalogItem,
      quantity: c.quantity,
    }));
    const res = await axios.post(
      API_URL,
      { items },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  getOrders: async (token) => {
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export default orderService;

