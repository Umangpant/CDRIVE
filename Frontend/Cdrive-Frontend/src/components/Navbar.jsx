import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppContext from "../Context/Context";

const Navbar = () => {
  const {
    cart = [],
    auth,
    logout,
    setCurrentLocation,
    data = [],
    currentCategory,
    setCurrentCategory,
  } = useContext(AppContext);
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const role = (auth?.role || auth?.user?.role || "").toLowerCase();
  const showCategoryFilter = role === "user" || role === "customer";
  const showAddCar = role === "admin";
  const showAdminDashboard = role === "admin";
  const showBookingList = role !== "admin";

  const categoryOptions = (() => {
    const defaults = ["Sedan", "SUV", "Hatchback", "Luxury"];
    const map = new Map();

    defaults.forEach((label) => {
      map.set(label.toLowerCase(), label);
    });

    (Array.isArray(data) ? data : []).forEach((item) => {
      const raw =
        item?.category ?? item?.categoryName ?? item?.category_type ?? "";
      const label = raw.toString().trim();
      if (!label) return;
      const key = label.toLowerCase();
      if (!map.has(key)) map.set(key, label);
    });

    const sorted = Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["All", ...sorted.filter((c) => c.toLowerCase() !== "all")];
  })();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    document.body.classList.toggle("dark-theme", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleThemeToggle = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* LEFT */}
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <svg
              className="brand-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M4 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
              <path d="M12 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
              <path d="M4.5 2a.5.5 0 0 0-.45.29L2.2 6H1.5A1.5 1.5 0 0 0 0 7.5V11a1 1 0 0 0 1 1h1a2 2 0 0 0 4 0h4a2 2 0 0 0 4 0h1a1 1 0 0 0 1-1V7.5A1.5 1.5 0 0 0 14.5 6h-.7l-1.85-3.71A.5.5 0 0 0 11.5 2h-7zM3.62 6 4.72 3.5h6.56L12.38 6H3.62z" />
            </svg>
            <span>CDRIVE</span>
          </Link>

          <Link to="/" className="nav-link nav-link-home">
            Available Cars
          </Link>

          {showCategoryFilter && (
            <div className="category-filter">
              <label htmlFor="categorySelect" className="category-label">
                Car Category
              </label>
              <select
                id="categorySelect"
                className="category-select"
                aria-label="Car Category"
                value={currentCategory || "All"}
                onChange={(e) => setCurrentCategory(e.target.value)}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showAddCar && (
            <Link to="/add-product" className="admin-add-btn">
              {"\u2795"} <span className="admin-add-label">Add Car</span>
            </Link>
          )}

          {showAdminDashboard && (
            <Link to="/admin/dashboard" className="admin-add-btn">
              Dashboard
            </Link>
          )}

          {!auth && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>

        {/* CENTER SEARCH */}
        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search city (e.g. Mumbai)"
            onChange={(e) => setCurrentLocation(e.target.value)}
          />
        </div>

        {/* RIGHT */}
        <div className="navbar-right">
          <button
            className={`theme-toggle ${isDark ? "dark" : "light"}`}
            title="Toggle theme"
            onClick={handleThemeToggle}
          >
            <span className="theme-toggle__icon" aria-hidden="true">
              {isDark ? "\uD83C\uDF19" : "\u2600\uFE0F"}
            </span>
            <span className="theme-toggle__label">
              {isDark ? "Dark Mode" : "Light Mode"}
            </span>
          </button>

          {auth && (
            <div className="navbar-user">
              <img
                src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                alt="user"
              />
              <span>Hi, {auth.user?.name}</span>
            </div>
          )}

          {auth && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}

          {showBookingList && (
            <Link to="/cart" className="booking-btn">
              {"\uD83D\uDCCB"}{" "}
              <span className="booking-label">Booking List</span>
              {cart.length > 0 && <span className="badge">{cart.length}</span>}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
