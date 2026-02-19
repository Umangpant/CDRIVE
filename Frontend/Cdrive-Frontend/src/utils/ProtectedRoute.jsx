import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const navigate = useNavigate();

  const normalizeRole = (value) => {
    const raw = (value ?? "").toString().trim();
    if (!raw) return "";
    const lowered = raw.toLowerCase();
    if (lowered === "undefined" || lowered === "null") return "";
    return lowered.replace(/^role_/, "");
  };

  const getStoredAuth = () => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch {}

    const storedRole =
      localStorage.getItem('role') ||
      user?.role ||
      user?.Role ||
      user?.userRole ||
      '';
    const isLoggedIn =
      localStorage.getItem('isLoggedIn') === 'true' ||
      Boolean(user) ||
      Boolean(localStorage.getItem('token'));

    return {
      isLoggedIn,
      role: normalizeRole(storedRole)
    };
  };

  const { isLoggedIn, role } = getStoredAuth();

  useEffect(() => {
    if (!isLoggedIn || !role) {
      navigate('/login');
      return;
    }

    if (requiredRole && role !== normalizeRole(requiredRole)) {
      navigate('/');
    }
  }, [navigate, requiredRole, isLoggedIn, role]);

  if (!isLoggedIn || !role) {
    return null;
  }

  if (requiredRole && role !== normalizeRole(requiredRole)) {
    return null;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
