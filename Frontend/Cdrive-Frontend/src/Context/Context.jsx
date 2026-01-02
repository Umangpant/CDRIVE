// src/Context/Context.jsx (FIXED)

import React, { createContext, useEffect, useState } from "react";
import API from "../axios.jsx";

const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],
  loading: true,
  currentCategory: "All",
  setCurrentCategory: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  currentLocation: "",
  setCurrentLocation: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  getTotalCartItems: () => 0,
  getTotalRentalCost: () => 0,
  refreshData: () => {},
  clearCart: () => {},
  addNewCarToData: () => {}, // <-- NEW: Add to the context definition
  removeCarFromData: () => {}, // <-- NEW
});

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart")) || []; } catch { return []; }
  });
  const [loading, setLoading] = useState(true);

  // new global filters
  const [currentCategory, setCurrentCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");

  const addToCart = (product) => {
    const idx = cart.findIndex(c => c.id === product.id);
    if (idx !== -1) setCart(cart.map((c,i) => i===idx ? { ...c, quantity: (c.quantity||1)+1 } : c));
    else setCart([...cart, { ...product, quantity: 1 }]);
  };
  const removeFromCart = (id) => setCart(cart.filter(c => c.id !== id));
  const updateQuantity = (id, q) => setCart(cart.map(c => c.id===id ? { ...c, quantity: Math.max(1, parseInt(q)||1) } : c));
  const clearCart = () => { setCart([]); localStorage.removeItem("cart"); };
  const getTotalCartItems = () => cart.length;
  const getTotalRentalCost = () => cart.reduce((s,i) => s + Number(i.dailyRentalRate||0) * Number(i.quantity||1), 0);

    // === FIX 1: New function to instantly update the car list state ===
    const addNewCarToData = (newCar) => {
        if (!newCar) return;
        setData(prevData => {
            // Add the new car to the beginning of the list 
            return [newCar, ...prevData]; 
        });
    };

  const removeCarFromData = (id) => {
      if (!id) return;
      setData(prevData => prevData.filter(car => car.id !== id && car._id !== id && car.productId !== id));
  };
  // -----------------------------------------------------------------

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/products");
      const arr = Array.isArray(res.data) ? res.data : res.data?.products || [];
      console.log("[Context] fetched products:", arr.length, "sample:", arr[0]);
      setData(arr);
      setIsError("");
    } catch (err) {
      console.error("[Context] fetchProducts ERROR:", err?.response || err);
      setIsError(err?.message || "Fetch failed");
      setData([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => { try { localStorage.setItem("cart", JSON.stringify(cart)); } catch {} }, [cart]);

  return (
    <AppContext.Provider value={{
      data, isError, cart, loading,
      currentCategory, setCurrentCategory,
      searchQuery, setSearchQuery,
      currentLocation, setCurrentLocation,
      addToCart, removeFromCart, updateQuantity,
      getTotalCartItems, getTotalRentalCost,
      refreshData: fetchProducts, 
      clearCart,
      addNewCarToData, // <-- FIX 2: Expose the new function
      removeCarFromData, // <-- NEW
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;