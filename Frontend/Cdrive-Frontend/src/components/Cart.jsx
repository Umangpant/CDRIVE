import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../Context/Context';
import CheckoutPopup from './CheckoutPopup';
import { Modal, Button } from 'react-bootstrap';
import API from '../axios.jsx';

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

    // Robust image URL helper (use axios baseURL when available)
    const getImageUrl = (item) => {
        const base = API?.defaults?.baseURL ? API.defaults.baseURL.replace(/\/$/, "") : "";
        const id = item?.id ?? item?._id ?? item?.productId;
        const imageName = item?.imageName ?? item?.image_name ?? item?.image;

        if (id) {
          return base ? `${base}/products/${id}/image` : `/api/products/${id}/image`;
        }
        if (imageName) {
          const staticBase = base ? base.replace(/\/api$/, "") : "";
          return staticBase ? `${staticBase}/images/${imageName}` : `/images/${imageName}`;
        }
        return "/placeholder.svg";
    };

    const handleImageError = (e, item) => {
        const imageName = item?.imageName || item?.image_name || item?.image;
        const base = API?.defaults?.baseURL ? API.defaults.baseURL.replace(/\/$/, "") : "";
        if (imageName) {
          const staticBase = base ? base.replace(/\/api$/, "") : "";
          e.currentTarget.onerror = null;
          e.currentTarget.src = staticBase ? `${staticBase}/images/${imageName}` : `/images/${imageName}`;
        } else {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/placeholder.svg";
        }
    };
    
    const handleQuantityChange = (id, event) => {
        updateQuantity(id, event.target.value);
    };
    
    const handleProceedToBooking = () => {
        if (!cart || cart.length === 0) {
            alert("Your booking list is empty!");
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
        const userName = auth?.user?.name || auth?.user?.username || '';
        const userEmail =
            auth?.user?.email ||
            auth?.user?.mail ||
            auth?.user?.username ||
            '';
        const bookingDate = new Date().toISOString().slice(0, 10); // LocalDate (YYYY-MM-DD)
        const preferredDate = preferences.preferredDate || "";
        const preferredTime = preferences.preferredTime || "";

        return {
            productId,
            numberOfDays,
            totalPrice,
            userName,
            userEmail,
            bookingDate,
            preferredDate,
            preferredTime,
        };
    };

    const postBooking = async (payload) => {
        const rootBase = API?.defaults?.baseURL
            ? API.defaults.baseURL.replace(/\/api\/?$/, "")
            : "";
        const tryPost = (path, baseOverride) =>
            API.post(path, payload, baseOverride ? { baseURL: baseOverride } : undefined);

        try {
            return await tryPost('/bookings');
        } catch (err1) {
            if (err1?.response?.status !== 404) throw err1;
            try {
                return await tryPost('/booking');
            } catch (err2) {
                if (err2?.response?.status !== 404 || !rootBase) throw err2;
                try {
                    return await tryPost('/bookings', rootBase);
                } catch (err3) {
                    if (err3?.response?.status !== 404) throw err3;
                    return tryPost('/booking', rootBase);
                }
            }
        }
    };

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
                .filter((p) => p.productId != null);
            if (payloads.length === 0) {
                alert("Booking failed: missing product info.");
                return;
            }
            await Promise.all(payloads.map(postBooking));
            localStorage.setItem("booking_ping", Date.now().toString());

            setSuccessDetails({ name, email, locations });
            setShowModal(false);
            setShowSuccess(true);
            clearCart();
        } catch (err) {
            console.error("Booking API error:", err);
            const msg =
                err?.response?.data
                    ? (typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data))
                    : err.message || "Booking failed";
            alert("Booking failed: " + msg);
        }
    };

    const handleSuccessDone = () => {
        setShowSuccess(false);
        navigate('/');
    };

    const totalCost = getTotalRentalCost() || 0;

    return (
        <div className="cart-page-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2>Your Booking List</h2>

            {!cart || cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem', color: '#666' }}>
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
                        const pickup = item.availableLocation || item.available_location || item.AvailableLocation || 'N/A';
                        const itemId = item.id ?? item._id ?? item.productId ?? index;

                        return (
                            <div key={itemId} className="cart-item-row" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '15px 0',
                                borderBottom: '1px solid #eee',
                                gap: '20px' 
                            }}>
                                <div className="item-details-group" style={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: '400px' }}>
                                    <img 
                                        src={getImageUrl(item)}
                                        alt={item.name || 'Car image'}
                                        style={{ width: '80px', height: 'auto', marginRight: '20px' }} 
                                        onError={(e) => handleImageError(e, item)}
                                    />
                                    <div style={{ minWidth: '150px' }}>
                                        <strong>{(item.brand || '') + ' ' + (item.name || '')}</strong> 
                                        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                                            Pickup: {pickup}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="item-quantity-col" style={{ textAlign: 'center', minWidth: '100px' }}>
                                    <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Days:</label>
                                    <input 
                                        type="number" 
                                        value={days} 
                                        min="1" 
                                        onChange={(e) => handleQuantityChange(itemId, e)}
                                        style={{ width: '60px', textAlign: 'center', padding: '5px' }} 
                                    />
                                </div>

                                <div className="item-price-col" style={{ textAlign: 'right', fontWeight: 'bold', minWidth: '120px' }}>
                                    ₹{lineTotal.toFixed(2)}
                                </div>

                                <div className="item-delete-col" style={{ textAlign: 'center', minWidth: '50px' }}>
                                    <button onClick={() => removeFromCart(itemId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red', fontSize: '1.5rem' }}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    
                    <div style={{ textAlign: 'right', padding: '20px 0', borderTop: '2px solid #ccc', marginTop: '20px' }}>
                        <h3 style={{ fontSize: '1.5rem' }}>Total Rental Cost: ₹{totalCost.toFixed(2)}</h3>
                        <button 
                            onClick={handleProceedToBooking}
                            className="btn-proceed" 
                            style={{ marginTop: '15px', padding: '10px 30px', fontSize: '1.2rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
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

            <Modal show={showSuccess} onHide={() => setShowSuccess(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Congratulations! 🎉</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ textAlign: 'center', padding: '10px 8px 4px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>✅</div>
                        <h4 style={{ marginBottom: '8px' }}>You are booked!</h4>
                        <p style={{ margin: '0 0 6px', color: '#555' }}>
                            The car owner will contact you shortly
                            {successDetails.email ? ` at ${successDetails.email}` : ' by email'}.
                        </p>
                        <p style={{ margin: '0 0 10px', color: '#555' }}>
                            Pickup location: <strong>{successDetails.locations || 'N/A'}</strong>
                        </p>
                        <p style={{ margin: 0, color: '#333' }}>
                            Thank you{successDetails.name ? `, ${successDetails.name}` : ''}! 🚗✨
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSuccessDone}>
                        Done
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Cart;
