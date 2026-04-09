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

const getStatusLabel = (status) =>
  status === "APPROVED" ? "Approved" : "Pending";

const AdminBookingModal = ({
  open,
  booking,
  onClose,
  onDelete,
  onApprove,
  approving = false,
  deleting = false,
}) => {
  if (!open || !booking) return null;

  const canDelete = Boolean(booking?.id);
  const isApproved = booking?.status === "APPROVED";
  const prettyTime = formatTime12(booking?.preferredTime);
  const preferred =
    booking?.preferredDate || prettyTime
      ? `${booking?.preferredDate || "N/A"} ${prettyTime || ""}`.trim()
      : "N/A";

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>Reservation Details</h3>
          <button className="admin-modal-close" type="button" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>
        <div className="admin-modal-body">
          <p>
            <strong>{booking.userName || "A customer"}</strong> reserved{" "}
            <strong>{booking.carName || "one of your cars"}</strong>.
          </p>
          <div className="admin-modal-status-row">
            <strong>Status:</strong>
            <span className={`admin-booking-status ${(isApproved ? "APPROVED" : "PENDING").toLowerCase()}`}>
              {getStatusLabel(booking?.status)}
            </span>
          </div>
          <div className="admin-modal-details">
            <div><strong>Email:</strong> {booking.userEmail || "N/A"}</div>
            <div><strong>Pickup:</strong> {booking.pickupLocation || "N/A"}</div>
            <div><strong>Days:</strong> {booking.days || "N/A"}</div>
            <div><strong>Preferred:</strong> {preferred}</div>
            <div><strong>Total:</strong> Rs. {booking.totalPrice || "0"}</div>
            <div><strong>Date:</strong> {booking.bookingDate || "N/A"}</div>
          </div>
          {!isApproved && (
            <p className="admin-modal-note">
              Approving this reservation will trigger the backend approval flow and email the customer.
            </p>
          )}
        </div>
        <div className="admin-modal-footer">
          <button className="btn outline" type="button" onClick={onClose}>
            Dismiss
          </button>
          {!isApproved && (
            <button
              className="btn primary"
              type="button"
              onClick={() => onApprove && onApprove(booking.id)}
              disabled={!canDelete || approving}
            >
              {approving ? "Approving..." : "Approve Reservation"}
            </button>
          )}
          <button
            className="btn danger"
            type="button"
            onClick={() => onDelete && onDelete(booking.id)}
            disabled={!canDelete || deleting}
          >
            {deleting ? "Removing..." : "Remove Reservation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingModal;
