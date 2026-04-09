import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import AppContext from '../Context/Context';
import CheckoutPopup from './CheckoutPopup';
import { API } from '../axios.jsx';

const Cart = () => {
    const navigate = useNavigate();
    const {
        cart,
        removeFromCart,
        updateQuantity,
        getTotalRentalCost,
        auth,
        clearCart
    } = useContext(AppContext);

    const [showModal, setShowModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successDetails, setSuccessDetails] = useState({
        name: '',
        email: '',
        locations: ''
    });
    const getImageUrl = (item) => {
        const id = item?.id ?? item?._id ?? item?.productId;
        const base = (API?.defaults?.baseURL ?? '').replace(/\/$/, '');

        if (id) {
            return base
                ? `${base}/products/${id}/image`
                : `/api/products/${id}/image`;
        }

        return '/placeholder.svg';
    };

    const handleImageError = (e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/placeholder.svg';
    };

    const handleQuantityChange = (id, event) => {
        updateQuantity(id, event.target.value);
    };

    const handleProceedToBooking = () => {
        if (!cart || cart.length === 0) {
            alert('Your booking list is empty!');
            return;
        }
        setShowModal(true);
    };

    const getPickupLocations = (items) => {
        const locations = new Set();
        (items || []).forEach((item) => {
            const location =
                item?.availableLocation ||
                item?.available_location ||
                item?.AvailableLocation ||
                '';
            if (location) locations.add(location);
        });
        return locations.size > 0 ? Array.from(locations).join(', ') : 'N/A';
    };

    const buildBookingPayload = (item, preferences = {}) => {
        const product = item?.product ?? item ?? {};
        const productId = product.id ?? product._id ?? product.productId ?? null;
        const numberOfDays = Math.max(1, Number(item.quantity ?? item.days ?? 1));
        const daily = Number(
            product.dailyRentalRate ??
            product.daily_rental_rate ??
            product.dailyRate ??
            0
        );
        const totalPrice = Math.max(0, daily * numberOfDays);

        return {
            productId,
            numberOfDays,
            totalPrice,
            bookingDate: new Date().toISOString().slice(0, 10),
            preferredDate: preferences.preferredDate || '',
            preferredTime: preferences.preferredTime || '',
        };
    };

    const postBooking = (payload) => API.post('/bookings', payload);

    const handleBookingConfirmed = async (preferences = {}) => {
        const name = auth?.user?.name || 'there';
        const email =
            auth?.user?.email ||
            auth?.user?.mail ||
            auth?.user?.username ||
            '';
        const locations = getPickupLocations(cart);

        try {
            const payloads = (cart || [])
                .map((item) => buildBookingPayload(item, preferences))
                .filter((payload) => payload.productId != null);

            if (payloads.length === 0) {
                alert('Booking failed: missing product info.');
                return;
            }

            await Promise.all(payloads.map(postBooking));
            localStorage.setItem('booking_ping', Date.now().toString());

            setSuccessDetails({ name, email, locations });
            setShowModal(false);
            setShowSuccess(true);
            clearCart();
        } catch (err) {
            console.error('Booking API error:', err);
            const msg = err?.response?.data
                ? (typeof err.response.data === 'string'
                    ? err.response.data
                    : JSON.stringify(err.response.data))
                : err.message || 'Booking failed';
            alert('Booking failed: ' + msg);
        }
    };

    const handleSuccessDone = () => {
        setShowSuccess(false);
        navigate('/');
    };

    const totalCost = getTotalRentalCost() || 0;

    return (
        <div className="cart-page-container">
            <h2 className="cart-page-title">Your Booking List</h2>

            {!cart || cart.length === 0 ? (
                <div className="cart-empty-state">
                    Your rental cart is empty. Add a car to start a booking.
                </div>
            ) : (
                <div className="cart-items-list">
                    {cart.map((item, index) => {
                        const days = Number(item.quantity || 1);
                        const dailyRate = Number(
                            item.dailyRentalRate ??
                            item.daily_rental_rate ??
                            item.dailyRate ??
                            0
                        );
                        const lineTotal = dailyRate * days;
                        const pickup =
                            item.availableLocation ||
                            item.available_location ||
                            item.AvailableLocation ||
                            'N/A';
                        const itemId = item.id ?? item._id ?? item.productId ?? index;
                        const carName = `${item.brand || ''} ${item.name || ''}`.trim();

                        return (
                            <div key={itemId} className="cart-item-row">
                                <div className="item-details-group">
                                    {/* ✅ FIXED: Now correctly hits /api/products/{id}/image */}
                                    <img
                                        src={getImageUrl(item)}
                                        alt={item.name || 'Car image'}
                                        className="cart-item-image"
                                        onError={handleImageError}
                                    />
                                    <div className="cart-item-copy">
                                        <strong className="cart-item-name">{carName}</strong>
                                        <div className="cart-item-pickup">Pickup: {pickup}</div>
                                    </div>
                                </div>

                                <div className="item-quantity-col">
                                    <label className="cart-item-quantity-label">Days:</label>
                                    <input
                                        type="number"
                                        value={days}
                                        min="1"
                                        onChange={(e) => handleQuantityChange(itemId, e)}
                                        className="cart-item-quantity-input"
                                    />
                                </div>

                                <div className="item-price-col">
                                    {'\u20B9'}{lineTotal.toFixed(2)}
                                </div>

                                <div className="item-delete-col">
                                    <button
                                        type="button"
                                        aria-label={`Remove ${carName || 'car'} from booking list`}
                                        onClick={() => removeFromCart(itemId)}
                                        className="cart-remove-btn"
                                    >
                                        {'\u2715'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <div className="cart-summary">
                        <h3 className="cart-total">
                            Total Rental Cost: {'\u20B9'}{totalCost.toFixed(2)}
                        </h3>
                        <button
                            type="button"
                            onClick={handleProceedToBooking}
                            className="btn-proceed"
                        >
                            Proceed to Booking
                        </button>
                    </div>
                </div>
            )}

            <CheckoutPopup
                show={showModal}
                handleClose={() => setShowModal(false)}
                cartItems={cart}
                totalPrice={totalCost}
                isAuthenticated={Boolean(auth)}
                handleCheckout={handleBookingConfirmed}
            />

            <Modal
                show={showSuccess}
                onHide={() => setShowSuccess(false)}
                centered
                dialogClassName="booking-success-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Reservation Complete</Modal.Title>
                </Modal.Header>

                <Modal.Body className="booking-success-modal__body">
                    <div className="booking-success-modal__hero">
                        <div className="booking-success-modal__icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M6 12.5L10 16.5L18.5 8" />
                            </svg>
                        </div>
                        <div className="booking-success-modal__hero-copy">
                            <h3 className="booking-success-modal__title">You&apos;re booked</h3>
                            <p className="booking-success-modal__description">
                                The car owner will contact you shortly
                                {successDetails.email
                                    ? ` at ${successDetails.email}`
                                    : ' through your registered email'}.
                            </p>
                        </div>
                    </div>

                    <div className="booking-success-modal__meta">
                        <div className="booking-success-modal__meta-card">
                            <span className="booking-success-modal__meta-label">Booking email</span>
                            <strong className="booking-success-modal__meta-value">
                                {successDetails.email || 'Shared through your account email'}
                            </strong>
                        </div>
                        <div className="booking-success-modal__meta-card">
                            <span className="booking-success-modal__meta-label">Pickup location</span>
                            <strong className="booking-success-modal__meta-value">
                                {successDetails.locations || 'To be confirmed'}
                            </strong>
                        </div>
                    </div>

                    <div className="booking-success-modal__note">
                        <span className="booking-success-modal__note-label">Saved successfully</span>
                        <p className="booking-success-modal__note-copy">
                            Thanks{successDetails.name ? `, ${successDetails.name}` : ''}. Your
                            booking request is ready.
                        </p>
                    </div>
                </Modal.Body>

                <Modal.Footer className="booking-success-modal__footer">
                    <button
                        type="button"
                        className="booking-success-modal__cta"
                        onClick={handleSuccessDone}
                    >
                        Back to Home
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Cart;