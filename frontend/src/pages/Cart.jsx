import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Heart, ArrowRight, Tag, X, ShoppingBag, Plus, Minus } from 'lucide-react';
import { 
  removeFromCart, updateCartItemQuantity, applyCoupon, removeCoupon 
} from '../redux/slices/cartSlice.js';
import { toggleWishlist } from '../redux/slices/wishlistSlice.js';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { cartItems, itemsPrice, discountPrice, taxPrice, shippingPrice, couponCode, couponDiscount, totalPrice } = useSelector((state) => state.cart);

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const handleQtyChange = (item, action) => {
    let nextQty = item.quantity;
    if (action === 'inc') {
      nextQty = Math.min(item.quantity + 1, item.inventory);
    } else if (action === 'dec') {
      nextQty = Math.max(item.quantity - 1, 1);
    }
    dispatch(updateCartItemQuantity({
      product: item.product,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      quantity: nextQty
    }));
  };

  const handleMoveToWishlist = (item) => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(item.product));
    dispatch(removeFromCart({
      product: item.product,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor
    }));
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (code === 'MYNTRA200' || code === 'FASHION20') {
      dispatch(applyCoupon(code));
      setPromoInput('');
    } else {
      setPromoError('Invalid coupon code. Try MYNTRA200 or FASHION20.');
    }
  };

  const getEstimatedDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f111a] py-12 transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-8">
          <ShoppingBag className="text-myntra-pink" size={24} />
          <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-wider text-myntra-dark dark:text-white">
            Shopping Bag <span className="font-normal text-myntra-gray text-sm">({cartItems.length} items)</span>
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-6 max-w-md mx-auto bg-gray-50/30 dark:bg-gray-900/10">
            <ShoppingBag size={48} className="text-myntra-gray dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-md font-bold text-myntra-dark dark:text-gray-200">YOUR BAG IS EMPTY</h2>
            <p className="text-xs text-myntra-gray mt-2 leading-relaxed">
              There is nothing in your shopping bag. Add items from your wishlist or view our catalog categories.
            </p>
            <Link 
              to="/catalog"
              className="mt-6 inline-block px-8 py-3 bg-myntra-pink text-white text-xs font-bold rounded uppercase tracking-wider shadow-md hover:bg-rose-600 transition-colors"
            >
              Shop Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: PRODUCTS LIST */}
            <div className="lg:col-span-7 space-y-4">
              {cartItems.map((item, index) => {
                const discAmt = Math.round((item.price * (item.discountPercentage || 0)) / 100);
                const itemFinalPrice = item.price - discAmt;

                return (
                  <div 
                    key={index}
                    className="flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded p-4 gap-4 md:gap-6 relative shadow-xs"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-26 sm:w-24 sm:h-32 bg-gray-50 dark:bg-gray-950 overflow-hidden rounded flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover object-top" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Brand & title */}
                        <h3 className="font-extrabold text-xs sm:text-sm text-myntra-dark dark:text-white uppercase truncate tracking-tight">{item.brand}</h3>
                        <p className="text-[11px] sm:text-xs text-myntra-gray dark:text-gray-400 mt-0.5 truncate">{item.title}</p>
                        
                        {/* Sizing / Colors metadata badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[10px] bg-myntra-light dark:bg-gray-800 text-myntra-dark dark:text-gray-250 px-2 py-0.5 rounded font-bold uppercase">Size: {item.selectedSize}</span>
                          <span className="text-[10px] bg-myntra-light dark:bg-gray-800 text-myntra-dark dark:text-gray-250 px-2 py-0.5 rounded font-bold uppercase">Color: {item.selectedColor}</span>
                        </div>
                      </div>

                      {/* Quantity Modifier controls */}
                      <div className="flex items-center gap-2 mt-3.5">
                        <span className="text-[11px] text-myntra-gray dark:text-gray-400">Qty:</span>
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                          <button 
                            onClick={() => handleQtyChange(item, 'dec')}
                            className="p-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-myntra-dark dark:text-gray-200"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-myntra-dark dark:text-gray-200">{item.quantity}</span>
                          <button 
                            onClick={() => handleQtyChange(item, 'inc')}
                            className="p-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-myntra-dark dark:text-gray-200"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>

                      {/* Pricing breakdowns */}
                      <div className="flex items-baseline gap-2 mt-3 flex-wrap">
                        <span className="text-xs sm:text-sm font-extrabold text-myntra-dark dark:text-gray-100">₹{itemFinalPrice * item.quantity}</span>
                        {item.discountPercentage > 0 && (
                          <>
                            <span className="text-[10px] line-through text-myntra-gray dark:text-gray-500">₹{item.price * item.quantity}</span>
                            <span className="text-[9px] font-bold text-red-500">({item.discountPercentage}% OFF)</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right corner actions: Delete + Move to Wishlist */}
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-3 text-myntra-gray">
                      <button 
                        onClick={() => dispatch(removeFromCart({ product: item.product, selectedSize: item.selectedSize, selectedColor: item.selectedColor }))}
                        className="hover:text-red-500 transition-colors p-1"
                        title="Remove Item"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleMoveToWishlist(item)}
                        className="hover:text-myntra-pink transition-colors p-1"
                        title="Move to Wishlist"
                      >
                        <Heart size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Promo coupons wrapper */}
              <div className="border border-gray-100 dark:border-gray-800 p-5 rounded bg-white dark:bg-gray-900 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-myntra-dark dark:text-gray-200 flex items-center gap-1.5 mb-3.5">
                  <Tag size={14} className="text-myntra-pink" /> Apply Promo Coupons
                </h3>

                {couponCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 px-3 py-2 rounded text-xs">
                    <span className="font-bold text-emerald-600">Coupon "{couponCode}" Applied!</span>
                    <button 
                      onClick={() => dispatch(removeCoupon())}
                      className="text-myntra-gray hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter MYNTRA200 or FASHION20"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent text-xs rounded outline-none focus:border-myntra-pink text-myntra-dark dark:text-gray-200"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-myntra-dark dark:bg-white text-white dark:text-myntra-dark font-extrabold text-xs uppercase tracking-wider rounded transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoError && <p className="text-[10px] text-red-500 font-semibold mt-1">{promoError}</p>}
                
                {/* Micro instructions */}
                {!couponCode && (
                  <div className="mt-3.5 space-y-1 text-[10px] text-myntra-gray font-semibold">
                    <p>• <span className="text-myntra-dark dark:text-gray-300">MYNTRA200</span>: Flat ₹200 off on order total.</p>
                    <p>• <span className="text-myntra-dark dark:text-gray-300">FASHION20</span>: Extra 20% off on your bag total.</p>
                  </div>
                )}
              </div>

              {/* Pricing Breakdowns */}
              <div className="border border-gray-100 dark:border-gray-800 p-5 rounded bg-white dark:bg-gray-900 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-myntra-dark dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">Price Details</h3>
                
                <div className="space-y-2.5 text-xs text-myntra-dark dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Total MRP</span>
                    <span>₹{itemsPrice}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-500 font-medium">
                    <span>Discount on MRP</span>
                    <span>-₹{discountPrice}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-500 font-medium">
                      <span>Coupon Discount ({couponCode})</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Convenience Fee / GST (12%)</span>
                    <span>₹{taxPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className={shippingPrice === 0 ? 'text-emerald-600 font-bold' : ''}>
                      {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-800" />

                <div className="flex justify-between text-sm font-extrabold text-myntra-dark dark:text-white uppercase tracking-tight">
                  <span>Total Amount</span>
                  <span>₹{totalPrice}</span>
                </div>

                {/* Estimated Delivery Date display */}
                <div className="bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100/30 dark:border-rose-900/10 p-3 rounded text-[11px] text-myntra-gray dark:text-gray-300 leading-relaxed font-semibold">
                  Estimated Delivery: <span className="text-myntra-dark dark:text-white font-bold">{getEstimatedDeliveryDate()}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-myntra-pink hover:bg-rose-600 text-white text-xs font-extrabold uppercase tracking-wider py-3.5 rounded flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  Place Order <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
