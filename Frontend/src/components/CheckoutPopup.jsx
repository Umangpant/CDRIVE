import React, { useEffect, useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Calendar3, Clock } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import API from "../axios.jsx";

const TIME_SLOTS = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"];

const pad = (value) => String(value).padStart(2, "0");

const toLocalDateInputValue = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const addDays = (date, days) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const formatTimeLabel = (timeValue) => {
  const [rawHour = "0", rawMinute = "00"] = (timeValue || "").split(":");
  const hourNumber = Number(rawHour);
  const suffix = hourNumber >= 12 ? "PM" : "AM";
  const displayHour = hourNumber % 12 || 12;
  return `${displayHour}:${rawMinute} ${suffix}`;
};

const openPicker = (ref) => {
  const input = ref.current;
  if (!input) return;

  if (typeof input.showPicker === "function") {
    try {
      input.showPicker();
      return;
    } catch {}
  }

  input.focus();
  try {
    input.click();
  } catch {}
};

const CheckoutPopup = ({
  show,
  handleClose,
  cartItems = [],
  totalPrice = 0,
  handleCheckout,
  isAuthenticated,
}) => {
  const navigate = useNavigate();
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const today = new Date();
  const minDate = toLocalDateInputValue(today);
  const quickDates = [
    { label: "Today", value: minDate },
    { label: "Tomorrow", value: toLocalDateInputValue(addDays(today, 1)) },
  ];

  useEffect(() => {
    if (show) {
      setPreferredDate("");
      setPreferredTime("");
    }
  }, [show]);

  const handleBookingClick = () => {
    const hasToken = Boolean(localStorage.getItem("token"));
    const hasLocalUser = Boolean(localStorage.getItem("user"));
    const allowed =
      typeof isAuthenticated === "boolean"
        ? isAuthenticated && hasToken
        : hasLocalUser && hasToken;

    if (!allowed) {
      navigate("/login");
      return;
    }

    if (!preferredDate || !preferredTime) {
      alert("Please select preferred date and time.");
      return;
    }

    handleCheckout({ preferredDate, preferredTime });
  };

  const buildProduct = (item) => item?.product ?? item ?? {};

  const getImageUrl = (item) => {
    const product = buildProduct(item);
    const id = product.id ?? product._id ?? product.productId;
    const imageName = product.imageName ?? product.image ?? product.image_name;
    const base = API?.defaults?.baseURL
      ? API.defaults.baseURL.replace(/\/$/, "")
      : "";

    if (id) {
      return base ? `${base}/products/${id}/image` : `/api/products/${id}/image`;
    }
    if (imageName) {
      const staticBase = base ? base.replace(/\/api$/, "") : "";
      return staticBase ? `${staticBase}/images/${imageName}` : `/images/${imageName}`;
    }
    return "/placeholder.svg";
  };

  const handleImgError = (e, item) => {
    e.currentTarget.onerror = null;
    const product = buildProduct(item);
    const imageName = product.imageName ?? product.image ?? product.image_name;
    const base = API?.defaults?.baseURL
      ? API.defaults.baseURL.replace(/\/$/, "")
      : "";

    if (imageName) {
      const staticBase = base ? base.replace(/\/api$/, "") : "";
      e.currentTarget.src = staticBase
        ? `${staticBase}/images/${imageName}`
        : `/images/${imageName}`;
      return;
    }

    e.currentTarget.src = "/placeholder.svg";
  };

  return (
    <div className="checkoutPopup">
      <Modal show={show} onHide={handleClose} size="lg" centered dialogClassName="checkout-modal">
        <Modal.Header closeButton>
          <Modal.Title>Booking Summary</Modal.Title>
        </Modal.Header>

        <Modal.Body className="checkout-modal__body">
          <div className="checkout-modal__stack">
            {(cartItems || []).length === 0 ? (
              <div className="checkout-modal__empty">No items in booking list.</div>
            ) : (
              (cartItems || []).map((item, idx) => {
                const product = buildProduct(item);
                const key = product.id ?? product._id ?? product.productId ?? idx;
                const qty = item.quantity ?? item.days ?? 1;
                const daily = Number(
                  product.dailyRentalRate ?? product.daily_rental_rate ?? 0
                );

                return (
                  <div key={key} className="checkout-modal__item">
                    <img
                      src={getImageUrl(item)}
                      alt={product.name ?? "car"}
                      className="checkout-modal__item-image"
                      onError={(e) => handleImgError(e, item)}
                    />

                    <div className="checkout-modal__item-copy">
                      <div className="checkout-modal__item-title">
                        {(product.brand ? `${product.brand} ` : "") + (product.name ?? "")}
                      </div>
                      <div className="checkout-modal__item-meta">Days: {qty}</div>
                      <div className="checkout-modal__item-price">
                        Rs {(daily * qty).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div className="booking-preferences">
              <div className="booking-pref-item">
                <div className="booking-pref-head">
                  <label htmlFor="preferred-date" className="booking-pref-label">
                    Preferred Date
                  </label>
                  <button
                    type="button"
                    className="booking-picker-button"
                    onClick={() => openPicker(dateInputRef)}
                  >
                    <Calendar3 size={16} />
                    <span>Open calendar</span>
                  </button>
                </div>
                <input
                  ref={dateInputRef}
                  id="preferred-date"
                  className="booking-picker-input"
                  type="date"
                  value={preferredDate}
                  min={minDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
                <div className="booking-shortcuts">
                  {quickDates.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className={`booking-chip ${preferredDate === item.value ? "active" : ""}`}
                      onClick={() => setPreferredDate(item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="booking-pref-item">
                <div className="booking-pref-head">
                  <label htmlFor="preferred-time" className="booking-pref-label">
                    Preferred Time
                  </label>
                  <button
                    type="button"
                    className="booking-picker-button"
                    onClick={() => openPicker(timeInputRef)}
                  >
                    <Clock size={16} />
                    <span>Pick time</span>
                  </button>
                </div>
                <input
                  ref={timeInputRef}
                  id="preferred-time"
                  className="booking-picker-input"
                  type="time"
                  value={preferredTime}
                  step="900"
                  onChange={(e) => setPreferredTime(e.target.value)}
                />
                <div className="booking-shortcuts">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`booking-chip ${preferredTime === slot ? "active" : ""}`}
                      onClick={() => setPreferredTime(slot)}
                    >
                      {formatTimeLabel(slot)}
                    </button>
                  ))}
                </div>
                <div className="booking-helper">
                  Use the native picker or tap a quick slot for a 15-minute step.
                </div>
              </div>
            </div>

            <div className="checkout-modal__total">
              <div className="checkout-modal__total-label">Total Rental Cost</div>
              <div className="checkout-modal__total-value">
                Rs {(totalPrice || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            className="checkout-modal__btn checkout-modal__btn--secondary"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button
            variant="primary"
            className="checkout-modal__btn checkout-modal__btn--primary"
            onClick={handleBookingClick}
            disabled={(cartItems || []).length === 0}
          >
            Confirm Booking
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckoutPopup;
