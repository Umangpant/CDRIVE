import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../axios.jsx';
import AppContext from '../Context/Context';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, removeCarFromData } = useContext(AppContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState('/placeholder.svg');

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get(`/products/${id}`);
        const fetched = res.data;
        setProduct(fetched);

        // Build robust image URL: try backend endpoint first, then static images folder
        const base = API?.defaults?.baseURL ? API.defaults.baseURL.replace(/\/$/, "") : "";
        const pid = fetched?.id ?? fetched?._id ?? fetched?.productId;
        const imageName = fetched?.imageName ?? fetched?.image ?? fetched?.image_name;

        if (pid) {
          setImageUrl(base ? `${base}/products/${pid}/image` : `/api/products/${pid}/image`);
        } else if (imageName) {
          // static file served from backend /images/<name>
          setImageUrl(`${base.replace(/\/api$/, '')}/images/${imageName}`);
          } else {
            setImageUrl('/placeholder.svg');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load car details. Check backend.');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleImageError = (e) => {
    // fallback to static imageName if available, otherwise placeholder
    const imageName = product?.imageName ?? product?.image ?? product?.image_name;
    if (imageName) {
      const base = API?.defaults?.baseURL ? API.defaults.baseURL.replace(/\/$/, "") : "";
      e.currentTarget.onerror = null;
      e.currentTarget.src = `${base.replace(/\/api$/, '')}/images/${imageName}`;
    } else {
      e.currentTarget.onerror = null;
      e.currentTarget.src = '/placeholder.svg';
    }
  };

  const handleUpdate = () => {
    // make sure this matches your router path for the UpdateProduct component
    navigate(`/update-product/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    try {
      await API.delete(`/products/${id}`);
      alert('Car successfully deleted!');
      removeCarFromData(id); // Update context immediately
      navigate('/');
    } catch (err) {
      console.error('Delete error', err);
      alert('Failed to delete car.');
    }
  };

  const handleAddToCart = () => {
    if (product) addToCart(product);
  };

  if (loading) return <div style={{ marginTop: 120, textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 120 }}>{error}</div>;
  if (!product) return <div style={{ marginTop: 120, textAlign: 'center' }}>Car not found</div>;

  const { name = '', brand = '', modelYear = '', dailyRentalRate = 0, category = '', fuelType = '', seatingCapacity = 0, availableLocation = '', description = '' } = product;

  return (
    <div className="containers">
      <div className="left-column">
        <img src={imageUrl} alt={name} className="product-detail-img" onError={handleImageError} />
        <div className="product-detail-actions">
          <h3>₹{dailyRentalRate} <span>/ day</span></h3>
          <div className="product-detail-buttons">
            <button className="btn btn-primary" onClick={handleAddToCart}>Book Now</button>
            <button className="btn btn-primary" onClick={handleUpdate}>Update</button>
            <button className="btn btn-primary" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>

      <div className="right-column">
        <div className="product-description" style={{ marginBottom: 40 }}>
          <h5 style={{ fontSize: '1.4rem' }}>~ {brand} ({modelYear})</h5>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 800 }}>{String(name).toUpperCase()}</h2>
        </div>

        <h3 className="product-description-heading">Key Specifications</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px', marginBottom: 40, fontSize: '1.2rem' }}>
          <div><strong>Category:</strong> {category}</div>
          <div><strong>Model Year:</strong> {modelYear}</div>
          <div><strong>Fuel Type:</strong> {fuelType}</div>
          <div><strong>Seating Capacity:</strong> {seatingCapacity} seats</div>
          <div><strong>Available Location:</strong> {availableLocation}</div>
          <div style={{ opacity: 0 }}></div>
        </div>

        <h3 className="product-description-heading">Car Description</h3>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
          {description || 'No detailed description was provided for this car.'}
        </p>
      </div>
    </div>
  );
};

export default Product;
