import React, { useEffect } from "react";

const BookingToast = ({ toast, onClose }) => {
  const isOpen = Boolean(toast?.open);
  const title = toast?.title || "Added to booking list";
  const message =
    toast?.message || "Your selected car is ready in your booking list.";

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (typeof onClose === "function") onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast?.key, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="booking-toast" role="status" aria-live="polite" aria-atomic="true">
      <div className="booking-toast__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5L9.25 16.75L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="booking-toast__body">
        <div className="booking-toast__eyebrow">Booking updated</div>
        <div className="booking-toast__title">{title}</div>
        <div className="booking-toast__message">{message}</div>
      </div>

      <div className="booking-toast__progress" aria-hidden="true" />
    </div>
  );
};

export default BookingToast;
