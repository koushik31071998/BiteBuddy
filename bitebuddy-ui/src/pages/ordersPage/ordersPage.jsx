import React, { useState, useEffect } from "react";
import orderService from "../../services/orderService";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      const data = await orderService.getOrders(token);
      setOrders(data.items);
    };
    fetchOrders();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Your Orders</h2>
      {orders.length === 0 ? (
        <p style={styles.empty}>No orders found</p>
      ) : (
        <ul style={styles.list}>
          {orders.map((order) => (
            <li key={order._id} style={styles.orderCard}>
              <strong>Order #{order._id}</strong> - {order.status} - Total: ${order.totalPrice}
              <ul style={styles.items}>
                {order.items.map((i, idx) => (
                  <li key={idx}>{i.name} - {i.quantity} x ${i.price}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "20px", marginTop: 40 },
  heading: { marginBottom: "15px" },
  empty: { color: "gray" },
  list: { listStyle: "none", padding: 0 },
  orderCard: { border: "1px solid #ccc", borderRadius: "5px", padding: "10px", marginBottom: "10px" },
  items: { listStyle: "none", paddingLeft: "15px" },
};
