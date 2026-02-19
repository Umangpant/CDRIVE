import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../axios.jsx";
import AppContext from "../Context/Context";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, auth } = useContext(AppContext);
  const role = (auth?.role || auth?.user?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("/placeholder.svg");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ownsProduct, setOwnsProduct] = useState(false);

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

  // -------------------------
  // LOAD PRODUCT
  // -------------------------
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await API.get(`/products/${id}`);
        const fetched = res.data;

        // ✅ Normalize object (MATCH Home.jsx)
        const mapped = {
          id: fetched.id || fetched._id || fetched.productId,
          name: fetched.name,
          brand: fetched.brand,
          modelYear: fetched.modelYear,
          dailyRentalRate: fetched.dailyRentalRate,
          category: fetched.category,
          fuelType: fetched.fuelType,
          seatingCapacity: fetched.seatingCapacity,
          availableLocation: fetched.availableLocation,
          description: fetched.description,
          imageName: fetched.imageName,
          addedBy:
            fetched.addedBy ??
            fetched.added_by ??
            fetched.adminId ??
            fetched.ownerId ??
            null,
        };

        setProduct(mapped);

        const base = API?.defaults?.baseURL
          ? API.defaults.baseURL.replace(/\/$/, "")
          : "";
        if (mapped.id) {
          setImageUrl(`${base}/products/${mapped.id}/image`);
        } else if (mapped.imageName) {
          const staticBase = base ? base.replace(/\/api$/, "") : "";
          setImageUrl(
            staticBase ? `${staticBase}/images/${mapped.imageName}` : `/images/${mapped.imageName}`
          );
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const checkOwnership = async () => {
      if (!isAdmin || !id) {
        if (mounted) setOwnsProduct(false);
        return;
      }
      const adminId = resolveAdminId();
      if (adminId == null) {
        if (mounted) setOwnsProduct(false);
        return;
      }

      if (product?.addedBy != null) {
        if (mounted) {
          setOwnsProduct(String(product.addedBy) === String(adminId));
        }
        return;
      }

      try {
        const res = await API.get("/admin/products");
        const list = Array.isArray(res.data) ? res.data : [];
        const has = list.some((item) => {
          const itemId = item?.id ?? item?._id ?? item?.productId;
          return String(itemId) === String(id);
        });
        if (mounted) setOwnsProduct(has);
      } catch {
        if (mounted) setOwnsProduct(false);
      }
    };
    checkOwnership();
    return () => {
      mounted = false;
    };
  }, [id, isAdmin, product?.addedBy]);

  const handleImageError = (e) => {
    if (!product) {
      e.currentTarget.src = "/placeholder.svg";
      return;
    }
    const imageName = product.imageName;
    const base = API?.defaults?.baseURL
      ? API.defaults.baseURL.replace(/\/$/, "")
      : "";
    if (imageName) {
      const staticBase = base ? base.replace(/\/api$/, "") : "";
      e.currentTarget.onerror = null;
      e.currentTarget.src = staticBase
        ? `${staticBase}/images/${imageName}`
        : `/images/${imageName}`;
    } else {
      e.currentTarget.src = "/placeholder.svg";
    }
  };


  if (loading)
    return <div style={{ marginTop: 150, textAlign: "center" }}>Loading…</div>;

  if (error)
    return (
      <div style={{ marginTop: 150, textAlign: "center", color: "red" }}>
        {error}
      </div>
    );

  if (!product)
    return (
      <div style={{ marginTop: 150, textAlign: "center" }}>
        Product not found
      </div>
    );

  const {
    name,
    brand,
    modelYear,
    dailyRentalRate,
    category,
    fuelType,
    seatingCapacity,
    availableLocation,
    description,
  } = product;
  // -------------------------
  // UI RETURN
  // -------------------------
  return (
    <div className="product-container">

      {/* LEFT SIDE */}
      <div className="product-left">
        <img
          src={imageUrl}
          alt={name}
          className="product-img"
          onError={handleImageError}
        />

        <h3 className="price">
          ₹{dailyRentalRate} <span>/ day</span>
        </h3>

        <div className="button-group">
          {!isAdmin && (
            <button
              className="btn primary"
              onClick={() => addToCart(product)} // FIXED
            >
              Book Now
            </button>
          )}
          {isAdmin && ownsProduct && (
            <button
              className="btn outline"
              onClick={() => navigate("/admin/dashboard")}
            >
              Manage in Dashboard
            </button>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="product-right">
        <h2 className="title">
          {brand} ({modelYear})
        </h2>
        <h1 className="car-name">{name}</h1>

        <h3 className="section-title">Key Specifications</h3>

        <div className="spec-box">
          <p><strong>Category:</strong> {category}</p>
          <p><strong>Model Year:</strong> {modelYear}</p>
          <p><strong>Fuel Type:</strong> {fuelType}</p>
          <p><strong>Seating Capacity:</strong> {seatingCapacity}</p>
          <p><strong>Available Location:</strong> {availableLocation}</p>
        </div>

        <h3 className="section-title">Description</h3>
        <p className="description-text">{description}</p>
      </div>
    </div>
  );
};

export default Product;
