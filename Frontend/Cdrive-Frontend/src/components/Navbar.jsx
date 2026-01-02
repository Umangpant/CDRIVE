// src/components/Navbar.jsx

import React, { useContext, useEffect, useRef, useState } from "react";
import AppContext from "../Context/Context.jsx";
import { Link } from "react-router-dom";
import "../App.css";

const CAR_CATEGORIES = ["All", "Sedan", "SUV", "Hatchback", "Luxury"];

const Navbar = () => {
  const { cart = [], setCurrentCategory, setCurrentLocation } = useContext(AppContext || {});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce searchVal => setCurrentLocation to allow live filtering
  useEffect(() => {
    // clear previous timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // if empty, clear location filter immediately
    if (!searchVal || !searchVal.trim()) {
      if (setCurrentLocation) setCurrentLocation("");
      debounceTimer.current = null;
      return;
    }

    debounceTimer.current = setTimeout(() => {
      const q = searchVal.trim();
      if (setCurrentLocation) {
        console.log("[Navbar] apply search location:", q);
        setCurrentLocation(q);
      }
    }, 280);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchVal, setCurrentLocation]);

  const toggleSearch = () => {
    setSearchOpen((s) => !s);
  };

  const submitSearch = (e) => {
    if (e) e.preventDefault();
    const q = (searchVal || "").trim();
    if (setCurrentLocation) {
      console.log("[Navbar] submit search location:", q);
      setCurrentLocation(q);
    }
    setSearchOpen(false);
  };

  const selectCategory = (cat) => {
    setSelectedCategory(cat);
    const payload = cat === "All" ? "" : cat;
    if (setCurrentCategory) {
      console.log("[Navbar] select category:", payload);
      setCurrentCategory(payload);
    }
    // clear location when category changes (keeps behavior consistent)
    if (setCurrentLocation) setCurrentLocation("");
    setDropdownOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    if (setCurrentCategory) setCurrentCategory("");
    if (setCurrentLocation) setCurrentLocation("");
    setSearchVal("");
  };

  return (
    <header className="navbar app-navbar" role="banner">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={clearFilters} aria-label="Home">
          <i className="bi bi-car-front-fill brand-icon" aria-hidden="true" />
          <span>CDRIVE</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <div className="nav-left">
            <Link to="/" onClick={() => { clearFilters(); }}>
              Available Cars
            </Link>

            <div
              className={`dropdown ${dropdownOpen ? "open" : ""}`}
              ref={dropdownRef}
              onClick={() => setDropdownOpen((s) => !s)}
            >
              <span className="dropdown-label" style={{ cursor: "pointer" }}>
                Car Category ▾
              </span>

              <ul className="dropdown-menu">
                {CAR_CATEGORIES.map((c) => (
                  <li key={c} style={{ listStyle: "none" }}>
                    <button
                      className="dropdown-item"
                      onClick={() => selectCategory(c)}
                    >
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <Link to="/add_product">Add Car (Admin)</Link>
          </div>

          <div className="nav-right">
            <div className={`search-container ${searchOpen ? "open" : ""}`} style={{ position: "relative" }}>
              <button
                className="icon-btn search-btn"
                title="Search"
                onClick={toggleSearch}
                aria-expanded={searchOpen}
              >
                <i className="bi bi-search" />
              </button>

              <form className="search-input-wrapper" onSubmit={submitSearch} style={{ right: 48 }}>
                <input
                  type="search"
                  placeholder="Location (city, area)..."   /* explicit placeholder requested */
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  autoFocus={searchOpen}
                  aria-label="Search location"
                />
                <button type="submit" style={{ display: "none" }}>Go</button>
              </form>
            </div>

            <button aria-label="Toggle theme" className="icon-btn theme-btn" onClick={() => {
              const isDark = document.body.classList.toggle("dark-theme");
              localStorage.setItem("theme", isDark ? "dark" : "light");
            }}>
              <i className="bi bi-sun" />
            </button>

            <Link to="/cart" className="btn-booking">
              <i className="bi bi-calendar-check-fill" style={{ marginRight: 8 }} />
              Booking List
              {Array.isArray(cart) && cart.length > 0 && (
                <span className="badge-count" aria-live="polite" style={{ marginLeft: 8 }}>{cart.length}</span>
              )}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

