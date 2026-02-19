import React, { createContext, useEffect, useState } from "react";
import API from "../axios.jsx";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ================= DATA =================
  const [data, setData] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("products_cache") || "null");
      return Array.isArray(cached?.items) ? cached.items : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("products_cache") || "null");
      return !Array.isArray(cached?.items) || cached.items.length === 0;
    } catch {
      return true;
    }
  });
  const [isError, setIsError] = useState("");

  // ================= CART =================
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  // ================= FILTERS =================
  const [currentCategory, setCurrentCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");

  // ================= AUTH (SINGLE SOURCE OF TRUTH) =================
  const [auth, setAuth] = useState(null);
  const [loginPrompt, setLoginPrompt] = useState({
    open: false,
    message: "",
    key: 0,
  });


  const normalizeRole = (value) => {
    const raw = (value ?? "").toString().trim();
    if (!raw) return "";
    const lowered = raw.toLowerCase();
    if (lowered === "undefined" || lowered === "null") return "";
    return lowered.replace(/^role_/, "");
  };

  //  Restore auth on refresh
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const storedRole =
        localStorage.getItem("role") ||
        user?.role ||
        user?.Role ||
        user?.userRole ||
        "";
      const role = normalizeRole(storedRole);
      if (user && role) {
        if (localStorage.getItem("role") !== role) {
          localStorage.setItem("role", role);
        }
        setAuth({ user, role });
      }
    } catch {}
  }, []);

  const logout = () => {
    localStorage.clear();
    setAuth(null);
  };

  // ================= PRODUCTS =================
  const fetchProducts = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const res = await API.get("/products");
      const items = Array.isArray(res.data) ? res.data : [];
      setData(items);
      try {
        localStorage.setItem(
          "products_cache",
          JSON.stringify({ items, ts: Date.now() })
        );
      } catch {}
      setIsError("");
    } catch (err) {
      setIsError("Failed to fetch products");
      if (!silent) setData([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const cached = (() => {
      try {
        return JSON.parse(localStorage.getItem("products_cache") || "null");
      } catch {
        return null;
      }
    })();

    const hasCache = Array.isArray(cached?.items) && cached.items.length > 0;
    fetchProducts({ silent: hasCache });
  }, []);

  // ================= CART HELPERS =================
  const resolveProductId = (item) =>
    item?.id ?? item?._id ?? item?.productId ?? null;

  const normalizeProduct = (product) => {
    if (!product || typeof product !== "object") return product;
    const id = resolveProductId(product);
    if (id && product.id !== id) {
      return { ...product, id };
    }
    return product;
  };

  const normalizeId = (value) =>
    value == null ? null : String(value);

  const removeCarFromData = (id) => {
    const targetId = normalizeId(id);
    setData((prev) => {
      const next = (prev || []).filter(
        (item) => normalizeId(resolveProductId(item)) !== targetId
      );
      try {
        localStorage.setItem(
          "products_cache",
          JSON.stringify({ items: next, ts: Date.now() })
        );
      } catch {}
      return next;
    });
  };

  const addToCart = (product) => {
    const hasToken = Boolean(localStorage.getItem("token"));
    const isLoggedIn = Boolean(auth?.user && hasToken);
    if (!isLoggedIn) {
      setLoginPrompt({
        open: true,
        message: "Please login first before booking or renting.",
        key: Date.now(),
      });
      return;
    }
    const normalized = normalizeProduct(product);
    const id = resolveProductId(normalized);

    setCart((prev) => {
      if (!id) {
        return [...prev, { ...normalized, quantity: 1 }];
      }

      const idx = prev.findIndex((c) => resolveProductId(c) === id);
      if (idx !== -1) {
        return prev.map((c, i) =>
          i === idx ? { ...c, quantity: (c.quantity || 1) + 1 } : c
        );
      }
      return [...prev, { ...normalized, id, quantity: 1 }];
    });
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((c) => resolveProductId(c) !== id));

  const updateQuantity = (id, value) => {
    const next = Number(value);
    const safeValue =
      Number.isFinite(next) && next > 0 ? Math.floor(next) : 1;

    setCart((prev) =>
      prev.map((item) =>
        resolveProductId(item) === id
          ? { ...item, quantity: safeValue }
          : item
      )
    );
  };

  const getTotalRentalCost = () => {
    return (cart || []).reduce((sum, item) => {
      const qty = Number(item.quantity || 1);
      const daily = Number(
        item.dailyRentalRate ??
          item.daily_rental_rate ??
          item.dailyRate ??
          0
      );
      if (!Number.isFinite(qty) || !Number.isFinite(daily)) return sum;
      return sum + daily * Math.max(qty, 1);
    }, 0);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const hideLoginPrompt = () => {
    setLoginPrompt((prev) => ({ ...prev, open: false }));
  };

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        isError,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalRentalCost,
        clearCart,
        currentCategory,
        setCurrentCategory,
        searchQuery,
        setSearchQuery,
        currentLocation,
        setCurrentLocation,
        auth,
        setAuth,
        logout,
        refreshData: fetchProducts,
        removeCarFromData,
        loginPrompt,
        hideLoginPrompt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
