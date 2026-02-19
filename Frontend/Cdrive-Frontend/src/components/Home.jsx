import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context";
import API from "../axios.jsx";
import Footer from "../components/Footer"; // IMPORTANT

const Home = () => {
  const {
    data = [],
    addToCart,
    loading,
    currentCategory,
    currentLocation,
    searchQuery,
    auth,
  } = useContext(AppContext);

  const role = (auth?.role || auth?.user?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  useEffect(() => {
    console.log(
      "[Home] currentCategory:",
      currentCategory,
      "currentLocation:",
      currentLocation,
      "searchQuery:",
      searchQuery
    );
  }, [currentCategory, currentLocation, searchQuery]);

  // ------------------------------------------------------------
  // FILTERED CARS
  // ------------------------------------------------------------
  const filteredCars = (Array.isArray(data) ? data : []).filter((p) => {
    const cat = String(currentCategory || "").trim().toLowerCase();
    if (cat && cat !== "all") {
      const prodCat = (
        p.category ??
        p.categoryName ??
        p.category_type ??
        ""
      )
        .toString()
        .trim()
        .toLowerCase();

      if (prodCat !== cat) return false;
    }

    const loc = String(currentLocation || "").trim().toLowerCase();
    if (loc) {
      const pickup = (
        p.AvailableLocation ??
        p.availableLocation ??
        p.available_location ??
        ""
      )
        .toString()
        .trim()
        .toLowerCase();

      if (!pickup.includes(loc)) return false;
    }

    const q = String(searchQuery || "").trim().toLowerCase();
    if (q) {
      const name = (p.name ?? p.title ?? "").toString().toLowerCase();
      const brand = (p.brand ?? "").toString().toLowerCase();
      const desc = (p.description ?? "").toString().toLowerCase();

      if (!name.includes(q) && !brand.includes(q) && !desc.includes(q))
        return false;
    }
    return true;
  });

  // ------------------------------------------------------------
  // IMAGE HANDLING
  // ------------------------------------------------------------
  const getImageUrl = (product) => {
    const base = API?.defaults?.baseURL
      ? API.defaults.baseURL.replace(/\/$/, "")
      : "";

    const id = product?.id ?? product?._id ?? product?.productId;
    const imageName =
      product?.imageName ?? product?.image_name ?? product?.image;

    if (id) {
      return base
        ? `${base}/products/${id}/image`
        : `/api/products/${id}/image`;
    }

    if (imageName) {
      const staticBase = base ? base.replace(/\/api$/, "") : "";
      return staticBase
        ? `${staticBase}/images/${imageName}`
        : `/images/${imageName}`;
    }

    return "/placeholder.svg";
  };

  const handleImageError = (e, product) => {
    e.currentTarget.onerror = null;
    const imageName =
      product?.imageName || product?.image_name || product?.image;
    const base = API?.defaults?.baseURL
      ? API.defaults.baseURL.replace(/\/$/, "")
      : "";

    if (imageName) {
      const staticBase = base ? base.replace(/\/api$/, "") : "";
      e.currentTarget.src = staticBase
        ? `${staticBase}/images/${imageName}`
        : `/images/${imageName}`;
    } else {
      e.currentTarget.src = "/placeholder.svg";
    }
  };

  // ------------------------------------------------------------
  // LOADING / EMPTY STATE
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        Loading cars…
      </div>
    );
  }

  if (!loading && (!filteredCars || filteredCars.length === 0)) {
    return (
      <>
        <div
          style={{ textAlign: "center", padding: "100px", fontSize: "1.2rem" }}
        >
          <div>
            {(currentCategory && currentCategory !== "All") ||
            currentLocation ||
            searchQuery
              ? "No Cars Match Your Filter Criteria."
              : "No Cars Available."}
          </div>

          <details
            style={{
              marginTop: 20,
              textAlign: "left",
              display: "inline-block",
            }}
          >
            <summary style={{ cursor: "pointer" }}>
              Debug: show fetched data
            </summary>
            <pre style={{ maxHeight: 300, overflow: "auto", width: 600 }}>
              {JSON.stringify(filteredCars.slice(0, 5), null, 2)}
            </pre>
          </details>
        </div>

        <Footer />
      </>
    );
  }

  // ------------------------------------------------------------
  // MAIN HOME PAGE UI
  // ------------------------------------------------------------
  return (
    <>
      {/* Make space for content but not full height */}
      <div style={{ padding: "20px", minHeight: "80vh" }}>
        <div className="home-grid">
          {filteredCars.map((product) => {
            const imgSrc = getImageUrl(product);

            return (
              <div className="home-card" key={product.id}>
                <Link to={`/product/${product.id}`} className="home-card-img-link">
                  <div className="home-card-img-wrap">
                    <img
                      src={imgSrc}
                      alt={product.name}
                      className="home-card-img"
                      onError={(e) => handleImageError(e, product)}
                    />
                  </div>
                </Link>

                <div className="home-card-body">
                  <p className="brand">{product.brand?.toUpperCase()}</p>

                  <h3 className="car-name">{product.name?.toUpperCase()}</h3>

                  <p className="model-year">
                    Model Year: <span>{product.modelYear}</span>
                  </p>

                  <h4 className="price">
                    ₹{product.dailyRentalRate}
                    <span>/ day</span>
                  </h4>

                  {!isAdmin && (
                    <button
                      className="btn-book"
                      onClick={() => addToCart(product)}
                    >
                      Book Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER FIXED HERE */}
      <Footer />
    </>
  );
};

export default Home;
