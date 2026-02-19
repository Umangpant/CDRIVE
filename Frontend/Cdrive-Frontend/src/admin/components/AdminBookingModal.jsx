import React from "react";

const formatTime12 = (time) => {
  if (!time) return "";
  const parts = String(time).split(":");
  if (parts.length < 2) return String(time);
  const hourRaw = parseInt(parts[0], 10);
  if (Number.isNaN(hourRaw)) return String(time);
  const minutes = parts[1].padStart(2, "0");
  const period = hourRaw >= 12 ? "PM" : "AM";
  const hour = hourRaw % 12 === 0 ? 12 : hourRaw % 12;
  return `${hour}:${minutes} ${period}`;
};

const AdminBookingModal = ({ open, booking, onClose, onDelete }) => {
  if (!open || !booking) return null;
  const canDelete = Boolean(booking?.id);

  const prettyTime = formatTime12(booking?.preferredTime);
  const preferred =
    booking?.preferredDate || prettyTime
      ? `${booking?.preferredDate || "N/A"} ${prettyTime || ""}`.trim()
      : "N/A";

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>New Booking Received!</h3>
          <button className="admin-modal-close" onClick={onClose} aria-label="Close">
            {"\u00D7"}
          </button>
        </div>
        <div className="admin-modal-body">
          <p>
            User <strong>{booking.userName || "Unknown"}</strong> booked{" "}
            <strong>{booking.carName || "a car"}</strong>.
          </p>
          <div className="admin-modal-details">
            <div><strong>Email:</strong> {booking.userEmail || "N/A"}</div>
            <div><strong>Pickup:</strong> {booking.pickupLocation || "N/A"}</div>
            <div><strong>Days:</strong> {booking.days || "N/A"}</div>
            <div><strong>Preferred:</strong> {preferred}</div>
            <div><strong>Total:</strong> {"\u20B9"}{booking.totalPrice || "0"}</div>
            <div><strong>Date:</strong> {booking.bookingDate || "N/A"}</div>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn primary" onClick={onClose}>Close</button>
          <button
            className="btn danger"
            onClick={() => onDelete && onDelete(booking.id)}
            disabled={!canDelete}
          >
            Remove Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingModal;
