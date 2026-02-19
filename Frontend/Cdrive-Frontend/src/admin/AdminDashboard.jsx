import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../Context/Context";
import AdminLayout from "./AdminLayout";
import AdminCarCard from "./components/AdminCarCard";
import AdminBookingCard from "./components/AdminBookingCard";
import AdminBookingModal from "./components/AdminBookingModal";
import AdminLoader from "./components/AdminLoader";
import {
  deleteCarById,
  deleteBookingById,
  fetchAdminBookings,
  fetchAdminCars,
} from "../services/adminApi";
import API from "../axios.jsx";

const normalizeCar = (car) => {
  const id = car?.id ?? car?._id ?? car?.productId;
  const base = API?.defaults?.baseURL ? API.defaults.baseURL.replace(/\/$/, "") : "";
  const imageUrl = id
    ? `${base || ""}/products/${id}/image`
    : "/placeholder.svg";
  const addedBy =
    car?.addedBy ??
    car?.added_by ??
    car?.adminId ??
    car?.ownerId ??
    car?.createdBy ??
    null;

  return {
    id,
    name: car?.name ?? car?.title ?? "",
    brand: car?.brand ?? "",
    modelYear: car?.modelYear ?? car?.model_year ?? "",
    dailyRentalRate: car?.dailyRentalRate ?? car?.daily_rental_rate ?? car?.dailyRate ?? 0,
    availableLocation: car?.availableLocation ?? car?.AvailableLocation ?? car?.available_location ?? "",
    fuelType: car?.fuelType ?? car?.fuel_type ?? "",
    category: car?.category ?? car?.categoryName ?? car?.category_type ?? "",
    seatingCapacity: car?.seatingCapacity ?? car?.seating_capacity ?? "",
    description: car?.description ?? "",
    imageUrl,
    addedBy,
  };
};

const normalizeBooking = (booking) => {
  const preferredDateTime =
    booking?.preferredDateTime ??
    booking?.preferred_date_time ??
    "";
  const dt =
    typeof preferredDateTime === "string" && preferredDateTime.includes("T")
      ? preferredDateTime.split("T")
      : [];

  return {
    id: booking?.id ?? booking?._id ?? booking?.bookingId ?? booking?.orderId,
    productId:
      booking?.productId ??
      booking?.carId ??
      booking?.product?.id ??
      booking?.product?.productId ??
      null,
    userName: booking?.userName ?? booking?.user?.name ?? booking?.name ?? "",
    userEmail: booking?.userEmail ?? booking?.user?.email ?? booking?.email ?? "",
    carName: booking?.carName ?? booking?.car?.name ?? booking?.product?.name ?? "",
    pickupLocation:
      booking?.pickupLocation ??
      booking?.location ??
      booking?.pickup ??
      booking?.availableLocation ??
      "",
    days:
      booking?.days ??
      booking?.quantity ??
      booking?.rentalDays ??
      booking?.numberOfDays ??
      booking?.number_of_days ??
      "",
    totalPrice: booking?.totalPrice ?? booking?.total ?? booking?.amount ?? "",
    bookingDate: booking?.bookingDate ?? booking?.createdAt ?? booking?.date ?? "",
    preferredDate:
      booking?.preferredDate ??
      booking?.preferred_date ??
      dt[0] ??
      "",
    preferredTime:
      booking?.preferredTime ??
      booking?.preferred_time ??
      (dt[1] ? dt[1].slice(0, 5) : "") ??
      "",
  };
};

const AdminDashboard = () => {
  const { auth, removeCarFromData } = useContext(AppContext);
  const navigate = useNavigate();
  const resolveAdminId = () => {
    const direct =
      auth?.user?.id ??
      auth?.user?._id ??
      auth?.user?.userId ??
      auth?.user?.adminId ??
      null;
    if (direct != null) return direct;

    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const candidate =
        payload?.id ??
        payload?.userId ??
        payload?.adminId ??
        payload?.uid ??
        null;
      if (candidate == null) return null;
      const str = String(candidate);
      return /^\d+$/.test(str) ? str : null;
    } catch {
      return null;
    }
  };
  const adminId = useMemo(resolveAdminId, [auth]);
  const adminIdStr = adminId != null ? String(adminId) : "";

  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [errorCars, setErrorCars] = useState("");
  const [errorBookings, setErrorBookings] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showNewBookingNotice, setShowNewBookingNotice] = useState(false);
  const lastBookingCountRef = React.useRef(null);
  const hideNoticeTimerRef = React.useRef(null);

  const carById = useMemo(() => {
    const map = new Map();
    (cars || []).forEach((car) => {
      if (car?.id != null) map.set(String(car.id), car);
    });
    return map;
  }, [cars]);

  const enrichedBookings = useMemo(() => {
    return (bookings || []).map((booking) => {
      const key = booking?.productId != null ? String(booking.productId) : null;
      const car = key ? carById.get(key) : null;
      const carName =
        booking.carName ||
        (car ? `${car.brand || ""} ${car.name || ""}`.trim() : "") ||
        (booking.productId != null ? `Car #${booking.productId}` : "");
      const pickupLocation =
        booking.pickupLocation || car?.availableLocation || "";
      return {
        ...booking,
        carName,
        pickupLocation,
      };
    });
  }, [bookings, carById]);

  useEffect(() => {
    const loadCars = async () => {
      setLoadingCars(true);
      setErrorCars("");
      try {
        const res = await fetchAdminCars();
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.products)
            ? res.data.products
            : Array.isArray(res.data?.items)
              ? res.data.items
              : [];
        const normalized = list.map(normalizeCar);
        const filtered = adminIdStr
          ? normalized.filter(
              (car) =>
                car.addedBy != null && String(car.addedBy) === adminIdStr
            )
          : normalized;
        setCars(filtered);
      } catch (err) {
        setErrorCars("Failed to load admin cars.");
      } finally {
        setLoadingCars(false);
      }
    };
    loadCars();
  }, [adminIdStr]);

  useEffect(() => {
    let mounted = true;
    const loadBookings = async () => {
      setLoadingBookings(true);
      setErrorBookings("");
      try {
        const res = await fetchAdminBookings();
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.bookings)
            ? res.data.bookings
            : Array.isArray(res.data?.items)
              ? res.data.items
              : [];
        const normalized = list.map(normalizeBooking);
        if (mounted) {
          setBookings(normalized);
          const prev = lastBookingCountRef.current;
          if (prev != null && normalized.length > prev) {
            setShowNewBookingNotice(true);
            if (hideNoticeTimerRef.current) {
              clearTimeout(hideNoticeTimerRef.current);
            }
            hideNoticeTimerRef.current = setTimeout(() => {
              setShowNewBookingNotice(false);
            }, 4000);
          }
          lastBookingCountRef.current = normalized.length;
        }
      } catch (err) {
        if (mounted) setErrorBookings("Failed to load bookings.");
      } finally {
        if (mounted) setLoadingBookings(false);
      }
    };
    loadBookings();
    const interval = setInterval(loadBookings, 15000);

    const handleStorage = (e) => {
      if (e.key === "booking_ping") {
        loadBookings();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
      if (hideNoticeTimerRef.current) {
        clearTimeout(hideNoticeTimerRef.current);
      }
    };
  }, []);

  const handleDelete = async (carId) => {
    if (!window.confirm("Delete this car?")) return;
    try {
      const targetId = carId != null ? String(carId) : "";
      await deleteCarById(carId);
      setCars((prev) =>
        prev.filter((car) => String(car.id) !== targetId)
      );
      if (typeof removeCarFromData === "function") {
        removeCarFromData(targetId);
      }
    } catch (err) {
      alert("Failed to delete car.");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!bookingId) {
      alert("Booking id not found.");
      return;
    }
    if (!window.confirm("Remove this booking?")) return;
    try {
      const targetId = String(bookingId);
      await deleteBookingById(bookingId);
      setBookings((prev) => {
        const next = (prev || []).filter((b) => String(b.id) !== targetId);
        lastBookingCountRef.current = next.length;
        return next;
      });
      setSelectedBooking(null);
    } catch (err) {
      alert("Failed to remove booking.");
    }
  };

  const leftContent = (
    <>
      <div className="admin-section-header">
        <div>
          <h2>Admin Cars</h2>
          <p>Manage only your listed vehicles.</p>
        </div>
        <button
          className="admin-bell"
          onClick={() => setPanelOpen((prev) => !prev)}
          aria-label="Toggle booking panel"
        >
          {"\uD83D\uDD14"}
          <span className="admin-bell-count">{enrichedBookings.length}</span>
        </button>
      </div>

      {loadingCars && <AdminLoader label="Loading cars..." />}
      {errorCars && <div className="admin-state error">{errorCars}</div>}
      {!loadingCars && !errorCars && cars.length === 0 && (
        <div className="admin-state">No Cars Added Yet</div>
      )}

      <div className="admin-cars-list">
        {cars.map((car) => (
          <AdminCarCard
            key={car.id}
            car={car}
            canEdit={
              Boolean(
                adminIdStr &&
                  car.addedBy != null &&
                  String(car.addedBy) === adminIdStr
              )
            }
            onUpdate={() => navigate(`/update-product/${car.id}`)}
            onDelete={() => handleDelete(car.id)}
          />
        ))}
      </div>
    </>
  );

  const rightContent = (
    <div className="admin-booking-panel">
      <div className="admin-booking-header">
        <h3>Bookings</h3>
      </div>

      {loadingBookings && <AdminLoader label="Loading bookings..." />}
      {errorBookings && <div className="admin-state error">{errorBookings}</div>}
      {showNewBookingNotice && (
        <div className="admin-booking-alert" role="status">
          <div className="admin-booking-emoji">{"\uD83C\uDF89"}</div>
          <div>New booking received</div>
        </div>
      )}

      {!loadingBookings && !errorBookings && enrichedBookings.length === 0 && (
        <div className="admin-state">No bookings yet.</div>
      )}

      <div className="admin-booking-list">
        {enrichedBookings.map((booking) => (
          <AdminBookingCard
            key={booking.id || booking.userEmail + booking.carName}
            booking={booking}
            onClick={() => setSelectedBooking(booking)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <AdminLayout left={leftContent} right={rightContent} isPanelOpen={panelOpen} />
      <AdminBookingModal
        open={Boolean(selectedBooking)}
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onDelete={handleDeleteBooking}
      />
    </>
  );
};

export default AdminDashboard;

