import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../Context/Context";
import AdminLayout from "./AdminLayout";
import AdminCarCard from "./components/AdminCarCard";
import AdminBookingCard from "./components/AdminBookingCard";
import AdminBookingModal from "./components/AdminBookingModal";
import AdminLoader from "./components/AdminLoader";
import {
  approveReservationById,
  deleteCarById,
  deleteBookingById,
  fetchAdminBookings,
  fetchAdminCars,
} from "../services/adminApi";
import API from "../axios.jsx";

const formatCountLabel = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const normalizeStatus = (value) => {
  const raw = (value ?? "").toString().trim().toUpperCase();
  return raw === "APPROVED" ? "APPROVED" : "PENDING";
};

const getBookingKey = (booking) =>
  booking?.id != null
    ? String(booking.id)
    : `${booking?.userEmail || "guest"}-${booking?.carName || "car"}`;

const normalizeCar = (car) => {
  const id = car?.id ?? car?._id ?? car?.productId;
  const base = API?.defaults?.baseURL ? API.defaults.baseURL.replace(/\/$/, "") : "";
  const imageUrl = id
    ? `${base || ""}/products/${id}/image`
    : "/placeholder.svg";

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
    status: normalizeStatus(
      booking?.status ??
      booking?.reservationStatus ??
      booking?.bookingStatus
    ),
  };
};

const AdminDashboard = () => {
  const { removeCarFromData } = useContext(AppContext);
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [errorCars, setErrorCars] = useState("");
  const [errorBookings, setErrorBookings] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showNewBookingNotice, setShowNewBookingNotice] = useState(false);
  const [approvingBookingId, setApprovingBookingId] = useState(null);
  const [deletingBookingId, setDeletingBookingId] = useState(null);
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
        status: normalizeStatus(booking?.status),
        carName,
        pickupLocation,
      };
    });
  }, [bookings, carById]);

  const selectedBooking = useMemo(() => {
    if (selectedBookingId == null) return null;
    return (
      enrichedBookings.find((booking) => getBookingKey(booking) === String(selectedBookingId)) ??
      null
    );
  }, [enrichedBookings, selectedBookingId]);

  const pendingReservationCount = useMemo(
    () => enrichedBookings.filter((booking) => booking.status !== "APPROVED").length,
    [enrichedBookings]
  );

  const fleetCountLabel = formatCountLabel(cars.length, "listing");
  const reservationCountLabel = formatCountLabel(
    enrichedBookings.length,
    "reservation"
  );
  const pendingReservationLabel = formatCountLabel(
    pendingReservationCount,
    "pending approval",
    "pending approvals"
  );

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
        setCars(list.map(normalizeCar));
      } catch (err) {
        setErrorCars("We couldn't load your fleet right now.");
      } finally {
        setLoadingCars(false);
      }
    };
    loadCars();
  }, []);

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
        if (mounted) {
          setErrorBookings("We couldn't load reservations right now.");
        }
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

  const handleApproveBooking = async (bookingId) => {
    if (!bookingId) {
      alert("Reservation id not found.");
      return;
    }

    const targetId = String(bookingId);
    const booking = enrichedBookings.find((item) => getBookingKey(item) === targetId);
    if (booking?.status === "APPROVED") {
      return;
    }

    if (!window.confirm("Approve this reservation? The customer will be notified by email.")) {
      return;
    }

    setApprovingBookingId(targetId);
    try {
      const res = await approveReservationById(bookingId);
      const normalized = res?.data ? normalizeBooking(res.data) : null;
      setBookings((prev) =>
        (prev || []).map((item) =>
          getBookingKey(item) === targetId
            ? {
                ...item,
                ...(normalized ?? {}),
                status: normalized?.status ?? "APPROVED",
              }
            : item
        )
      );
    } catch (err) {
      alert("Failed to approve reservation.");
    } finally {
      setApprovingBookingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!bookingId) {
      alert("Booking id not found.");
      return;
    }
    if (!window.confirm("Remove this booking?")) return;

    const targetId = String(bookingId);
    setDeletingBookingId(targetId);
    try {
      await deleteBookingById(bookingId);
      setBookings((prev) => {
        const next = (prev || []).filter((b) => getBookingKey(b) !== targetId);
        lastBookingCountRef.current = next.length;
        return next;
      });
      setSelectedBookingId(null);
    } catch (err) {
      alert("Failed to remove booking.");
    } finally {
      setDeletingBookingId(null);
    }
  };

  const leftContent = (
    <>
      <div className="admin-section-header">
        <div>
          <span className="admin-eyebrow">Fleet workspace</span>
          <h2>Your Fleet</h2>
          <p>Manage the cars you have listed and keep your inventory in sync.</p>
        </div>
        <div className="admin-header-actions">
          <span className="admin-chip">{fleetCountLabel}</span>
          <button
            className="admin-bell"
            type="button"
            onClick={() => setPanelOpen((prev) => !prev)}
            aria-label="Toggle reservation panel"
          >
            Bell
            <span className="admin-bell-count">{enrichedBookings.length}</span>
          </button>
        </div>
      </div>

      {loadingCars && <AdminLoader label="Loading your fleet..." />}
      {errorCars && <div className="admin-state error">{errorCars}</div>}
      {!loadingCars && !errorCars && cars.length === 0 && (
        <div className="admin-state admin-state--empty">
          <div className="admin-state-title">No listings yet</div>
          <div className="admin-state-copy">
            Add your first car to start receiving reservations and customer
            activity here.
          </div>
        </div>
      )}

      <div className="admin-cars-list">
        {cars.map((car) => (
          <AdminCarCard
            key={car.id}
            car={car}
            canEdit={true}
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
        <div>
          <span className="admin-eyebrow">Reservation inbox</span>
          <h3>Bookings for Your Cars</h3>
        </div>
        <div className="admin-booking-summary">
          <span className="admin-chip">{reservationCountLabel}</span>
          <span className="admin-chip">{pendingReservationLabel}</span>
          <span className="admin-sync-pill">Live refresh every 15s</span>
        </div>
      </div>

      {loadingBookings && <AdminLoader label="Syncing reservations..." />}
      {errorBookings && <div className="admin-state error">{errorBookings}</div>}
      {showNewBookingNotice && (
        <div className="admin-booking-alert" role="status">
          <div className="admin-booking-emoji">{"\uD83C\uDF89"}</div>
          <div>
            <div className="admin-booking-alert-title">New reservation received</div>
            <div className="admin-booking-alert-copy">
              A customer just booked one of your listed cars.
            </div>
          </div>
        </div>
      )}

      {!loadingBookings && !errorBookings && enrichedBookings.length === 0 && (
        <div className="admin-state admin-state--empty">
          <div className="admin-state-title">No reservations yet</div>
          <div className="admin-state-copy">
            When someone books one of your listed cars, it will appear here
            automatically.
          </div>
        </div>
      )}

      <div className="admin-booking-list">
        {enrichedBookings.map((booking) => (
          <AdminBookingCard
            key={getBookingKey(booking)}
            booking={booking}
            onClick={() => setSelectedBookingId(getBookingKey(booking))}
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
        onClose={() => setSelectedBookingId(null)}
        onDelete={handleDeleteBooking}
        onApprove={handleApproveBooking}
        approving={Boolean(selectedBooking) && approvingBookingId === getBookingKey(selectedBooking)}
        deleting={Boolean(selectedBooking) && deletingBookingId === getBookingKey(selectedBooking)}
      />
    </>
  );
};

export default AdminDashboard;

