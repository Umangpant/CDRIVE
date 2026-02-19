import React from "react";

const AdminCarCard = ({ car, onUpdate, onDelete, canEdit = true }) => {
  return (
    <div className="admin-car-card">
      <div className="admin-car-media">
        <img
          src={car.imageUrl}
          alt={car.name || "Car"}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      <div className="admin-car-body">
        <div className="admin-car-title">
          <h3>
            {car.brand} {car.name}
          </h3>
          <span className="admin-car-year">{car.modelYear || "N/A"}</span>
        </div>

        <div className="admin-car-meta">
          <div><strong>Price:</strong> ₹{car.dailyRentalRate}/day</div>
          <div><strong>Location:</strong> {car.availableLocation || "N/A"}</div>
          <div><strong>Fuel:</strong> {car.fuelType || "N/A"}</div>
          <div><strong>Category:</strong> {car.category || "N/A"}</div>
          <div><strong>Seating:</strong> {car.seatingCapacity || "N/A"}</div>
        </div>

        <p className="admin-car-description">
          {car.description || "No description provided."}
        </p>

        <div className="admin-car-actions">
          <button
            className="btn outline"
            onClick={onUpdate}
            disabled={!canEdit}
            title={
              canEdit ? "Update car" : "You can only edit cars you added."
            }
          >
            Update
          </button>
          <button
            className="btn danger"
            onClick={onDelete}
            disabled={!canEdit}
            title={
              canEdit ? "Delete car" : "You can only delete cars you added."
            }
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCarCard;
