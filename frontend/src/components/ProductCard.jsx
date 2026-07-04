import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import { toggleWishlist } from '../redux/slices/wishlistSlice.js';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  if (!product) return null;

  const isWishlisted = wishlistItems && Array.isArray(wishlistItems)
    ? wishlistItems.some((item) => item && item._id === product._id)
    : false;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  const discountAmount = Math.round(((product.price || 0) * (product.discountPercentage || 0)) / 100);
  const finalPrice = Math.round((product.price || 0) - discountAmount);

  return (
    <div className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 rounded overflow-hidden shadow-myntra hover:shadow-myntra-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
      
      {/* Product Image & Badges */}
      <Link to={`/product/${product._id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-gray-950">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=80'}
          alt={product.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />

        {/* Rating Badge */}
        {product.ratings > 0 && (
          <div className="absolute left-2.5 bottom-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-myntra-dark dark:text-gray-100 flex items-center gap-0.5 border border-gray-100/50 dark:border-gray-800/50 shadow-sm z-10">
            <span>{typeof product.ratings === 'number' ? product.ratings.toFixed(1) : (Number(product.ratings) || 0).toFixed(1)}</span>
            <span className="text-yellow-500">★</span>
            <span className="text-myntra-gray dark:text-gray-400 font-normal border-l border-gray-200 dark:border-gray-700 pl-1 ml-0.5">
              {product.numReviews}
            </span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {product.inventory === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="bg-white dark:bg-gray-800 text-myntra-dark dark:text-white px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded shadow-md">
              Out of stock
            </span>
          </div>
        )}

        {/* Wishlist Icon Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3.5 right-3.5 p-2 rounded-full shadow-sm hover:scale-110 transition-transform z-20 ${
            isWishlisted
              ? 'bg-myntra-pink text-white'
              : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-myntra-dark dark:text-gray-200 hover:text-myntra-pink'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} className="transition-colors duration-200" />
        </button>

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-3.5 left-3.5 bg-red-500 text-white font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm z-20">
            {product.discountPercentage}% OFF
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-white dark:bg-gray-900">
        <Link to={`/product/${product._id}`} className="block">
          {/* Brand */}
          <h3 className="font-extrabold text-sm text-myntra-dark dark:text-white truncate uppercase tracking-tight mb-0.5">
            {product.brand}
          </h3>
          {/* Title */}
          <p className="text-xs text-myntra-gray dark:text-gray-400 truncate mb-2">
            {product.title}
          </p>
        </Link>

        {/* Price Section */}
        <div className="flex items-center gap-1.5 flex-wrap mt-auto">
          <span className="text-sm font-extrabold text-myntra-dark dark:text-gray-100">
            ₹{finalPrice}
          </span>
          {product.discountPercentage > 0 && (
            <>
              <span className="text-xs line-through text-myntra-gray dark:text-gray-500">
                ₹{product.price}
              </span>
              <span className="text-[10px] font-bold text-red-500 dark:text-red-400">
                ({product.discountPercentage}% OFF)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
