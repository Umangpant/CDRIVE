import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Product from "./components/Product";
import Cart from "./components/Cart";
import Login from "./pages/login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AddProduct from "./components/AddProduct";
import UpdateProduct from "./components/UpdateProduct";
import ProtectedRoute from "./utils/ProtectedRoute";
import AdminDashboard from "./admin/AdminDashboard";
import LoginPromptToast from "./components/LoginPromptToast";
import BookingToast from "./components/BookingToast";
import AppContext from "./Context/Context";

function App() {
  const { loginPrompt, hideLoginPrompt, bookingToast, hideBookingToast } =
    React.useContext(AppContext);
  return (
    <>
      <Navbar />
      <div className="app-toast-stack" aria-live="polite" aria-atomic="true">
        <LoginPromptToast prompt={loginPrompt} onClose={hideLoginPrompt} />
        <BookingToast toast={bookingToast} onClose={hideBookingToast} />
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />

        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AddProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/update-product/:id"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <UpdateProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
