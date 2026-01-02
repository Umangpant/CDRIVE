import React, { useContext, useState } from 'react';
import AppContext from '../Context/Context';
import CheckoutPopup from './CheckoutPopup';
import { Button } from 'react-bootstrap';
import API from '../axios.jsx';

const Cart = () => {
    const { 
        cart, 
        removeFromCart,
        updateQuantity, 
        getTotalRentalCost 
    } = useContext(AppContext);

    const [showModal, setShowModal] = useState(false);

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
                    {cart.map((item) => {
                        const days = Number(item.quantity || 1);
                        const dailyRate = Number(item.dailyRentalRate || item.dailyRentalRate || 0);
                        const lineTotal = dailyRate * days;
                        const pickup = item.availableLocation || item.available_location || item.AvailableLocation || 'N/A';

                        return (
                            <div key={item.id} className="cart-item-row" style={{
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
                                        onChange={(e) => handleQuantityChange(item.id, e)}
                                        style={{ width: '60px', textAlign: 'center', padding: '5px' }} 
                                    />
                                </div>

                                <div className="item-price-col" style={{ textAlign: 'right', fontWeight: 'bold', minWidth: '120px' }}>
                                    ₹{lineTotal.toFixed(2)}
                                </div>

                                <div className="item-delete-col" style={{ textAlign: 'center', minWidth: '50px' }}>
                                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red', fontSize: '1.5rem' }}>
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
                handleCheckout={() => {
                    alert("Booking confirmed! (Actual checkout logic goes here)");
                    setShowModal(false);
                }}
            />
        </div>
    );
};

export default Cart;