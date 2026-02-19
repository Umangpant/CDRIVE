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

const AdminBookingCard = ({ booking, onClick }) => {
  const prettyTime = formatTime12(booking?.preferredTime);
  const preferred =
    booking?.preferredDate || prettyTime
      ? `${booking?.preferredDate || "N/A"} ${prettyTime || ""}`.trim()
      : "N/A";

  return (
    <button className="admin-booking-card" onClick={onClick}>
      <div className="admin-booking-title">
        <span>{booking.userName || "Unknown User"}</span>
        <span className="admin-booking-date">{booking.bookingDate || "\u2014"}</span>
      </div>
      <div className="admin-booking-meta">
        <div><strong>Email:</strong> {booking.userEmail || "N/A"}</div>
        <div><strong>Car:</strong> {booking.carName || "N/A"}</div>
        <div><strong>Pickup:</strong> {booking.pickupLocation || "N/A"}</div>
        <div><strong>Days:</strong> {booking.days || "N/A"}</div>
        <div><strong>Preferred:</strong> {preferred}</div>
        <div><strong>Total:</strong> {"\u20B9"}{booking.totalPrice || "0"}</div>
      </div>
    </button>
  );
};

export default AdminBookingCard;
