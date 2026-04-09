import API from "../axios.jsx";

export const fetchAdminCars = () => API.get("/admin/products");

export const fetchAdminBookings = () => API.get("/admin/bookings");

export const approveReservationById = (reservationId) => {
  if (reservationId == null || reservationId === "") {
    return Promise.reject(new Error("Missing reservation id"));
  }
  return API.post(`/reservations/${encodeURIComponent(reservationId)}/approve`);
};

export const deleteCarById = (carId) => {
  if (carId == null || carId === "") {
    return Promise.reject(new Error("Missing car id"));
  }
  return API.delete(`/products/${encodeURIComponent(carId)}`);
};

export const deleteBookingById = (bookingId) => {
  if (bookingId == null || bookingId === "") {
    return Promise.reject(new Error("Missing booking id"));
  }
  return API.delete(`/admin/bookings/${encodeURIComponent(bookingId)}`);
};
