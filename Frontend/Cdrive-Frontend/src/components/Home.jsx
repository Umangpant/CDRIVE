import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context";
import API from "../axios.jsx";

const Home = () => {
  const { data = [], addToCart, loading, currentCategory, currentLocation, searchQuery } = useContext(AppContext);

  useEffect(() => {
    console.log("[Home] currentCategory:", currentCategory, "currentLocation:", currentLocation, "searchQuery:", searchQuery);
  }, [currentCategory, currentLocation, searchQuery]);

  const filteredCars = (Array.isArray(data) ? data : []).filter((p) => {
    const cat = String(currentCategory || "").trim().toLowerCase();
    if (cat && cat !== "all") {
      const prodCat = (p.category ?? p.categoryName ?? p.category_type ?? "").toString().trim().toLowerCase();
      if (prodCat !== cat) return false;
    }
    const loc = String(currentLocation || "").trim().toLowerCase();
    if (loc) {
      const pickup = (p.AvailableLocation ?? p.availableLocation ?? p.available_location ?? "").toString().trim().toLowerCase();
      if (!pickup.includes(loc)) return false;
    }
    const q = String(searchQuery || "").trim().toLowerCase();
    if (q) {
      const name = (p.name ?? p.title ?? "").toString().toLowerCase();
      const brand = (p.brand ?? "").toString().toLowerCase();
      const desc = (p.description ?? "").toString().toLowerCase();
      if (!name.includes(q) && !brand.includes(q) && !desc.includes(q)) return false;
    }
    return true;
  });

  const getImageUrl = (product) => {
    const base = API?.defaults?.baseURL ? API.defaults.baseURL.replace(/\/$/, "") : "";
    const id = product?.id ?? product?._id ?? product?.productId;
    const imageName = product?.imageName ?? product?.image_name ?? product?.image;

    if (id) {
      return base ? `${base}/products/${id}/image` : `/api/products/${id}/image`;
    }
    if (imageName) {
      const staticBase = base ? base.replace(/\/api$/, "") : "";
      return staticBase ? `${staticBase}/images/${imageName}` : `/images/${imageName}`;
    }
    return "/placeholder.svg";
  };

  const handleImageError = (e, product) => {
    e.currentTarget.onerror = null;
    const imageName = product?.imageName || product?.image_name || product?.image;
    const base = API?.defaults?.baseURL ? API.defaults.baseURL.replace(/\/$/, "") : "";
    if (imageName) {
      const staticBase = base ? base.replace(/\/api$/, "") : "";
      e.currentTarget.src = staticBase ? `${staticBase}/images/${imageName}` : `/images/${imageName}`;
    } else {
      e.currentTarget.src = "/placeholder.svg";
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "100px" }}>Loading cars…</div>;
  }

  if (!loading && (!filteredCars || filteredCars.length === 0)) {
    return (
      <div style={{ textAlign: "center", padding: "100px", fontSize: "1.2rem" }}>
        <div>{(currentCategory && currentCategory !== "All") || currentLocation || searchQuery ? "No Cars Match Your Filter Criteria." : "No Cars Available."}</div>
        <details style={{ marginTop: 20, textAlign: "left", display: "inline-block" }}>
          <summary style={{ cursor: "pointer" }}>Debug: show fetched data (first 5 items)</summary>
          <pre style={{ maxHeight: 300, overflow: "auto", width: 600 }}>{JSON.stringify(filteredCars.slice(0,5), null, 2)}</pre>
        </details>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", minHeight: "100vh" }}>
      <div className="grid">
        {filteredCars.map((product) => {
          const imgSrc = getImageUrl(product);

          return (
            <div className="card" key={product.id}>
              <Link to={`/product/${product.id}`}>
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="card-img-top"
                  onError={(e) => handleImageError(e, product)}
                />
              </Link>

              <div className="card-body">
                <h5>{product.name?.toUpperCase()}</h5>
                <p>{product.brand}</p>

                <h5>
                  ₹{product.dailyRentalRate} <span>/ day</span>
                </h5>

                <button
                  className="btn-book"
                  onClick={() => addToCart(product)}
                >
                  Book Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
