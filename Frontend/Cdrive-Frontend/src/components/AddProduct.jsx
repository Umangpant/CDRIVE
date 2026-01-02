// src/components/AddProduct.jsx (FIXED for Alignment and Data Refresh)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios.jsx";
import "../index.css";

const AddProduct = ({ onCarAdded }) => {
  const navigate = useNavigate();

  const initialCar = {
    name: "",
    brand: "",
    category: "All",
    dailyRentalRate: "",
    description: "",
    seatingCapacity: "",
    fuelType: "",
    modelYear: "",
    availableLocation: "",
    extra: "",
  };

  const [car, setCar] = useState(initialCar);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setCar((prev) => ({ ...prev, [name]: type === "number" ? (value === "" ? "" : Number(value)) : value }));
  };

  const handleImageChange = (e) => setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null);

  const handleReset = () => { setCar(initialCar); setImageFile(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!car.name || !car.brand) { alert("Please provide Brand and Model Name."); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();

      // must match @RequestPart MultipartFile imageFile on backend
      if (imageFile) formData.append("imageFile", imageFile);

      // append product as application/json blob so Spring can convert to ProductModel
      const productBlob = new Blob([JSON.stringify(car)], { type: "application/json" });
      formData.append("product", productBlob);

      // DO NOT set Content-Type manually — let browser/axios set multipart boundary
      const res = await API.post("/products", formData);

      console.log("Add product success:", res.data);
      alert("Car added");
      handleReset();
      if (onCarAdded) onCarAdded();
      navigate("/");
    } catch (err) {
      console.error("Add product error full:", err);
      // show useful message for network / server errors
      const serverMsg = err?.response?.data
        ? (typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data))
        : err.message || "Network or server error";
      alert("Failed to add car — server response: " + serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-wrapper">
      <div className="custom-form-card">
        <form className="add-product-form" onSubmit={handleSubmit} noValidate>
          <h2 style={{ textAlign: "center", marginBottom: 16 }}>Add New Car for Rent</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Brand</label>
              <input name="brand" value={car.brand} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Model Name</label>
              <input name="name" value={car.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category" value={car.category} onChange={handleChange}>
                <option>All</option>
                <option>Sedan</option>
                <option>SUV</option>
                <option>Hatchback</option>
                <option>Luxury</option>
              </select>
            </div>

            <div className="form-group">
              <label>Model Year</label>
              <input name="modelYear" value={car.modelYear} onChange={handleChange} type="number" />
            </div>

            <div className="form-group">
              <label>Daily Rental Rate</label>
              <input name="dailyRentalRate" value={car.dailyRentalRate} onChange={handleChange} type="number" />
            </div>

            <div className="form-group">
              <label>Available Location</label>
              <input name="availableLocation" value={car.availableLocation} onChange={handleChange} />
            </div>

            <div className="form-group span-2">
              <label>Description</label>
              <textarea name="description" value={car.description} onChange={handleChange} rows="5" />
            </div>

            <div className="form-group">
              <label>Image</label>
              <input name="imageFile" onChange={handleImageChange} type="file" accept="image/*" />
            </div>

            <div className="form-group">
              <label>Extra (optional)</label>
              <input name="extra" value={car.extra} onChange={handleChange} />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 20 }}>
            <button type="button" className="btn-secondary" onClick={handleReset} disabled={submitting}>Reset</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save Car"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;