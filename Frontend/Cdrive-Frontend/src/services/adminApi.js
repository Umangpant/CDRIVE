import API from "../axios.jsx";

export const fetchAdminCars = () => {
  return API.get("/admin/products");
};

export const fetchAdminBookings = () => {
  return API.get("/admin/bookings");
};

export const deleteCarById = (carId) => {
  if (carId == null || carId === "") {
    return Promise.reject(new Error("Missing car id"));
  }
  return API.delete(`/products/${encodeURIComponent(carId)}`);
};

export const deleteBookingById = async (bookingId) => {
  if (bookingId == null || bookingId === "") {
    return Promise.reject(new Error("Missing booking id"));
  }
  const id = encodeURIComponent(bookingId);

  try {
    return await API.delete(`/admin/bookings/${id}`);
  } catch (errAdmin) {
    try {
      return await API.delete(`/bookings/${id}`);
    } catch (errBookings) {
      return API.delete(`/booking/${id}`);
    }
  }
};
