import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../axios.jsx";
import AppContext from "../Context/Context";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshData } = useContext(AppContext);

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    category: "All",
    dailyRentalRate: "",
    description: "",
    modelYear: "",
    availableLocation: "",
    extra: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageTs, setImageTs] = useState(Date.now());

  useEffect(() => {
    let mounted = true;
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        if (mounted && res?.data) {
          const d = res.data;
          setProduct({
            name: d.name ?? "",
            brand: d.brand ?? "",
            category: d.category ?? "All",
            dailyRentalRate: d.dailyRentalRate ?? d.daily_rental_rate ?? "",
            description: d.description ?? "",
            modelYear: d.modelYear ?? d.model_year ?? "",
            availableLocation: d.availableLocation ?? d.AvailableLocation ?? "",
            extra: d.extra ?? "",
          });
        }
      } catch (err) {
        console.error("fetch product error", err);
        alert("Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => { mounted = false; };
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProduct((p) => ({ ...p, [name]: type === "number" ? (value === "" ? "" : Number(value)) : value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null);
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/products/${id}`);
      if (res?.data) {
        const d = res.data;
        setProduct({
          name: d.name ?? "",
          brand: d.brand ?? "",
          category: d.category ?? "All",
          dailyRentalRate: d.dailyRentalRate ?? d.daily_rental_rate ?? "",
          description: d.description ?? "",
          modelYear: d.modelYear ?? d.model_year ?? "",
          availableLocation: d.availableLocation ?? d.AvailableLocation ?? "",
          extra: d.extra ?? "",
        });
      }
      setImageFile(null);
    } catch (err) {
      console.error("reset error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }
      const productBlob = new Blob([JSON.stringify(product)], { type: "application/json" });
      formData.append("product", productBlob);

      // do NOT set Content-Type header; axios will set boundary
      await API.put(`/products/${id}`, formData);

      // refresh preview cache-buster
      setImageTs(Date.now());
      // refresh list data so Home updates immediately after navigation
      if (refreshData) {
        await refreshData({ silent: true });
      }
      alert("Product updated");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("update error", err);
      const msg = err?.response?.data ? (typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data)) : err.message;
      alert("Update failed: " + msg);
    } finally {
      setSaving(false);
    }
  };

  const imageBase = API?.defaults?.baseURL ? API.defaults.baseURL.replace(/\/$/, "") : "";
  const imageSrc = imageBase ? `${imageBase}/products/${id}/image?ts=${imageTs}` : `/api/products/${id}/image?ts=${imageTs}`;

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;


  return (
    <div className="add-product-wrapper">
      <div className="custom-form-card">
        <button
          type="button"
          className="close-add-car"
          aria-label="Close update form"
          onClick={() => navigate("/admin/dashboard")}
        >
          ×
        </button>
        <form className="add-product-form" onSubmit={handleSubmit} noValidate>
          <h2 style={{ textAlign: "center", marginBottom: 16 }}>Update Car</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Brand</label>
              <input name="brand" value={product.brand} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Model Name</label>
              <input name="name" value={product.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={product.category} onChange={handleChange}>
                <option>All</option><option>Sedan</option><option>SUV</option><option>Hatchback</option><option>Luxury</option>
              </select>
            </div>
            <div className="form-group">
              <label>Model Year</label>
              <input name="modelYear" value={product.modelYear} onChange={handleChange} type="number" />
            </div>
            <div className="form-group">
              <label>Daily Rental Rate</label>
              <input name="dailyRentalRate" value={product.dailyRentalRate} onChange={handleChange} type="number" />
            </div>
            <div className="form-group">
              <label>Available Location</label>
              <input name="availableLocation" value={product.availableLocation} onChange={handleChange} />
            </div>
            <div className="form-group span-2">
              <label>Description</label>
              <textarea name="description" value={product.description} onChange={handleChange} rows="5" />
            </div>
            <div className="form-group">
              <label>Image</label>
              <input name="imageFile" type="file" accept="image/*" onChange={handleImageChange} />
              <div style={{ marginTop: 8 }}>
                <img src={imageSrc} alt="current" style={{ maxWidth: "220px", maxHeight: "140px", objectFit: "cover", borderRadius: 6 }} onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src="/placeholder-car.png"}}/>
              </div>
            </div>
            <div className="form-group">
              <label>Extra (optional)</label>
              <input name="extra" value={product.extra} onChange={handleChange} />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 20 }}>
            <button type="button" className="btn-secondary" onClick={handleReset} disabled={saving}>Reset</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Update Car"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
