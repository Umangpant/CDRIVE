import React, { useEffect } from "react";

const LoginPromptToast = ({ prompt, onClose }) => {
  const isOpen = Boolean(prompt?.open);
  const message = prompt?.message || "Please login first before booking.";

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (typeof onClose === "function") onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [prompt?.key, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="login-toast" role="status" aria-live="polite">
      <div className="login-toast-icon" aria-hidden="true">
        🔐
      </div>
      <div className="login-toast-body">
        <div className="login-toast-title">Login required</div>
        <div className="login-toast-message">{message}</div>
      </div>
    </div>
  );
};

export default LoginPromptToast;
