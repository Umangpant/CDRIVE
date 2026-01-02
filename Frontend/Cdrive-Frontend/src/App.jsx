// src/App.jsx (Ensure you are using this version)

import React, { useContext, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import AppContext from "./Context/Context.jsx";

// Import components
import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home.jsx";
import Product from "./components/Product.jsx";
import AddProduct from "./components/AddProduct.jsx";
import UpdateProduct from "./components/UpdateProduct.jsx";
import Cart from "./components/Cart.jsx";
import Footer from "./components/Footer.jsx";

function App() {
  const ctx = useContext(AppContext);

    // Get 'refreshData' (which fetches the full list again)
    const { refreshData } = ctx;

  useEffect(() => {
    console.log(
      "[App] context snapshot:",
      { loading: ctx?.loading, dataLength: Array.isArray(ctx?.data) ? ctx.data.length : typeof ctx?.data }
    );
  }, [ctx?.loading, ctx?.data]);

  return (
    <div className="App">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={ <Home /> } />
          <Route path="/product/:id" element={<Product />} />
          
            {/* Pass 'refreshData' as the onCarAdded prop */}
          <Route 
                path="/add_product" 
                element={<AddProduct onCarAdded={refreshData} />} 
            />
            
          <Route path="/update-product/:id" element={<UpdateProduct />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;