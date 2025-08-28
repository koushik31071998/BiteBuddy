import React, { useState } from "react";
import { addCatalogItem } from "../../services/api";

export default function AddCatalogPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    let priceValue = parseFloat(form.price);
   formData.append("price", priceValue.toString()); 
    formData.append("category", form.category);
    if (file) formData.append("imageUrl", file);
 
    try {
      await addCatalogItem(formData);
      alert("Item added successfully!");
      setForm({ name: "", description: "", price: "", category: "" });
      setFile(null);
    } catch (err) {
      console.error("Failed to add item", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>➕ Add Menu Item</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Item Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ display: "block", margin: "10px 0", padding: "8px" }}
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
          style={{ display: "block", margin: "10px 0", padding: "8px" }}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          style={{ display: "block", margin: "10px 0", padding: "8px" }}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          style={{ display: "block", margin: "10px 0", padding: "8px" }}
        />
        <input
          type="file"
          onChange={handleFileChange}
          style={{ display: "block", margin: "10px 0" }}
        />
        <button type="submit">Add Item</button>
      </form>
    </div>
  );
}
