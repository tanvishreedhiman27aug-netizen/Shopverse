import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// Pages imports
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';

import { fetchWishlist } from './redux/slices/wishlistSlice.js';

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Sync user wishlist on start or change
  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white dark:bg-[#0f111a] text-myntra-dark dark:text-gray-100 transition-colors duration-200">
        
        {/* Sticky Header Navigation */}
        <Navbar />

        {/* Content routing viewports */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Client-specific Routes */}
            <Route path="/wishlist" element={user ? <Wishlist /> : <Navigate to="/login?redirect=wishlist" />} />
            <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login?redirect=checkout" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login?redirect=profile" />} />
            <Route path="/order-success/:id" element={user ? <OrderSuccess /> : <Navigate to="/login" />} />

            {/* Administrator Dashboard route */}
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
