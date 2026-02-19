// src/components/AddProduct.jsx (FIXED for Alignment and Data Refresh)

import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios.jsx";
import AppContext from "../Context/Context";
import "../index.css";

const AddProduct = ({ onCarAdded }) => {
  const navigate = useNavigate();
  const { auth, refreshData } = useContext(AppContext);
  const role = (
    auth?.role ||
    auth?.user?.role ||
    localStorage.getItem("role") ||
    ""
  )
    .toString()
    .toLowerCase();
  const resolveAdminId = () => {
    const direct =
      auth?.user?.id ??
      auth?.user?._id ??
      auth?.user?.userId ??
      auth?.user?.adminId ??
      null;
    if (direct != null) return direct;

    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const candidate =
        payload?.id ??
        payload?.userId ??
        payload?.adminId ??
        payload?.uid ??
        null;
      if (candidate == null) return null;
      const str = String(candidate);
      return /^\d+$/.test(str) ? str : null;
    } catch {
      return null;
    }
  };
  const adminId = resolveAdminId();

  const MAX_IMAGE_BYTES = 1024 * 1024; // 1 MB
  const MAX_IMAGE_DIM = 1280;
  const OUTPUT_QUALITY_START = 0.82;
  const OUTPUT_QUALITY_MIN = 0.42;
  const OUTPUT_QUALITY_STEP = 0.1;

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

  const handleImageChange = (e) =>
    setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null);

  const handleReset = () => { setCar(initialCar); setImageFile(null); };

  const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image."));
      img.src = src;
    });

  const canvasToBlob = (canvas, quality) =>
    new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
    });

  const compressImageIfNeeded = async (file) => {
    if (!file) return null;
    if (!file.type || !file.type.startsWith("image/")) {
      throw new Error("Please upload a valid image file.");
    }
    if (file.size <= MAX_IMAGE_BYTES) return file;

    const dataUrl = await readFileAsDataURL(file);
    const img = await loadImage(dataUrl);

    const maxDim = Math.max(img.width, img.height);
    const scale = maxDim > MAX_IMAGE_DIM ? MAX_IMAGE_DIM / maxDim : 1;
    const targetW = Math.max(1, Math.round(img.width * scale));
    const targetH = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, targetW, targetH);

    let quality = OUTPUT_QUALITY_START;
    let blob = await canvasToBlob(canvas, quality);

    while (blob && blob.size > MAX_IMAGE_BYTES && quality > OUTPUT_QUALITY_MIN) {
      quality = Math.max(OUTPUT_QUALITY_MIN, quality - OUTPUT_QUALITY_STEP);
      blob = await canvasToBlob(canvas, quality);
    }

    if (!blob || blob.size > MAX_IMAGE_BYTES) {
      throw new Error(
        "Image is too large. Please use a smaller image (<= 1 MB)."
      );
    }

    const name = file.name ? file.name.replace(/\.[^/.]+$/, "") : "upload";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!car.name || !car.brand) {
      alert("Please provide Brand and Model Name.");
      return;
    }
    if (!imageFile) {
      alert("Please select an image file.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();

      // must match @RequestPart MultipartFile imageFile on backend
      const safeImage = await compressImageIfNeeded(imageFile);
      if (safeImage) formData.append("imageFile", safeImage);

      // append product as application/json blob so Spring can convert to ProductModel
      const payload = { ...car };
      if (adminId != null) {
        payload.addedBy = adminId;
        formData.append("adminId", String(adminId));
      }
      const productBlob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      formData.append("product", productBlob);

      // DO NOT set Content-Type manually — let browser/axios set multipart boundary
      const extraHeaders =
        adminId != null
          ? { "X-Admin-Id": String(adminId), adminId: String(adminId) }
          : undefined;
      const res = await API.post(
        "/products",
        formData,
        extraHeaders ? { headers: extraHeaders } : undefined
      );

      console.log("Add product success:", res.data);
      if (typeof refreshData === "function") {
        try {
          await refreshData({ silent: true });
        } catch {}
      }
      alert("Car added");
      handleReset();
      if (onCarAdded) onCarAdded();
      navigate(role === "admin" ? "/admin/dashboard" : "/");
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
        <button
          type="button"
          className="close-add-car"
          aria-label="Close add car form"
          onClick={() => navigate("/")}
        >
          ×
        </button>
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
