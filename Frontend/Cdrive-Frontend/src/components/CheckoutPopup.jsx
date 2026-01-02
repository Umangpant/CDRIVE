import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import API from '../axios.jsx';

const CheckoutPopup = ({ show, handleClose, cartItems = [], totalPrice = 0, handleCheckout }) => {
  // Normalize item -> product object and build image URL with fallbacks
  const buildProduct = (item) => {
    // item might be a product, or { product, quantity } or cart entry shape
    const product = item?.product ?? item;
    return product || {};
  };

  const getImageUrl = (item) => {
    const product = buildProduct(item);
    const id = product.id ?? product._id ?? product.productId;
    const imageName = product.imageName ?? product.image ?? product.image_name;
    const base = API?.defaults?.baseURL ? API.defaults.baseURL.replace(/\/$/, "") : "";

    if (id) {
      // backend endpoint serving binary image
      return base ? `${base}/products/${id}/image` : `/api/products/${id}/image`;
    }
    if (imageName) {
      // static images folder (strip possible /api from base)
      const staticBase = base ? base.replace(/\/api$/, "") : "";
      return staticBase ? `${staticBase}/images/${imageName}` : `/images/${imageName}`;
    }
    return '/placeholder.svg';
  };

  const handleImgError = (e, item) => {
    e.currentTarget.onerror = null;
    const product = buildProduct(item);
    const imageName = product.imageName ?? product.image ?? product.image_name;
    const base = API?.defaults?.baseURL ? API.defaults.baseURL.replace(/\/$/, "") : "";
    if (imageName) {
      const staticBase = base ? base.replace(/\/api$/, "") : "";
      e.currentTarget.src = staticBase ? `${staticBase}/images/${imageName}` : `/images/${imageName}`;
    } else {
      e.currentTarget.src = '/placeholder.svg';
    }
  };

  return (
    <div className="checkoutPopup">
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Booking Summary</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(cartItems || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24 }}>No items in booking list.</div>
            ) : (
              (cartItems || []).map((item, idx) => {
                const product = buildProduct(item);
                const key = product.id ?? product._id ?? product.productId ?? idx;
                const qty = item.quantity ?? item.days ?? 1;
                const daily = product.dailyRentalRate ?? product.daily_rental_rate ?? 0;
                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '12px 6px',
                      borderBottom: '1px solid #eee',
                      flexWrap: 'wrap'
                    }}
                  >
                    <img
                      src={getImageUrl(item)}
                      alt={product.name ?? 'car'}
                      style={{ width: 88, height: 64, objectFit: 'cover', borderRadius: 6, flex: '0 0 88px' }}
                      onError={(e) => handleImgError(e, item)}
                    />

                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>
                        {(product.brand ? `${product.brand} ` : '') + (product.name ?? '')}
                      </div>
                      <div style={{ color: '#666', marginTop: 4 }}>Days: {qty}</div>
                      <div style={{ marginTop: 6, fontWeight: 700, color: '#007bff' }}>
                        ₹{(daily * qty).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Total Rental Cost:</div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>₹{(totalPrice || 0).toFixed(2)}</div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleCheckout} disabled={(cartItems||[]).length===0}>Confirm Booking</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckoutPopup;
