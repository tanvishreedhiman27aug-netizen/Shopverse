import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  User, Gift, MapPin, ClipboardList, Shield, RefreshCw, ChevronDown, ChevronUp, Route, CheckCircle, Clock 
} from 'lucide-react';
import { fetchProfile, updateProfile, fetchAddresses, deleteAddress } from '../redux/slices/authSlice.js';
import { fetchMyOrders, returnOrder } from '../redux/slices/orderSlice.js';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, profile, addresses, loading: authLoading } = useSelector((state) => state.auth);
  const { orders, loading: orderLoading } = useSelector((state) => state.orders);

  // Profile view tabs: 'details', 'addresses', 'orders'
  const [activeTab, setActiveTab] = useState('orders');

  // Profile Edit fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [genderPref, setGenderPref] = useState('Unisex');
  const [sizePref, setSizePref] = useState([]);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Address helper state
  const [addrDeleteLoading, setAddrDeleteLoading] = useState('');

  // Expanded Order details trace ID
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=profile');
      return;
    }
    dispatch(fetchProfile());
    dispatch(fetchAddresses());
    dispatch(fetchMyOrders());
  }, [user, dispatch, navigate]);

  // Sync edit form fields when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      if (profile.stylePreferences) {
        setGenderPref(profile.stylePreferences.gender || 'Unisex');
        setSizePref(profile.stylePreferences.preferredSizes || []);
      }
    }
  }, [profile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSuccess(false);
    const action = await dispatch(updateProfile({
      name,
      email,
      stylePreferences: {
        gender: genderPref,
        preferredSizes: sizePref
      }
    }));
    if (updateProfile.fulfilled.match(action)) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  };

  const handleSizePrefToggle = (sz) => {
    const next = sizePref.includes(sz) ? sizePref.filter(s => s !== sz) : [...sizePref, sz];
    setSizePref(next);
  };

  const handleAddrDelete = async (addrId) => {
    setAddrDeleteLoading(addrId);
    await dispatch(deleteAddress(addrId));
    setAddrDeleteLoading('');
  };

  const handleReturnRequest = async (orderId) => {
    if (window.confirm('Are you sure you want to request a return for this order?')) {
      await dispatch(returnOrder(orderId));
      dispatch(fetchMyOrders()); // sync list
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'text-amber-500 bg-amber-55/10 border-amber-200';
      case 'Shipped': return 'text-blue-500 bg-blue-55/10 border-blue-200';
      case 'Delivered': return 'text-emerald-500 bg-emerald-55/10 border-emerald-250';
      case 'Return_Requested': return 'text-purple-500 bg-purple-55/10 border-purple-200';
      case 'Returned': return 'text-slate-500 bg-slate-55/10 border-slate-200';
      case 'Cancelled': return 'text-red-500 bg-red-55/10 border-red-200';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0c14] py-12 transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: TABS SELECTOR PANEL */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-5 shadow-xs space-y-4">
            
            {/* User header avatar card */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-myntra-pink flex-shrink-0">
                <img src={profile?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-xs text-myntra-dark dark:text-white truncate uppercase">{profile?.name || user?.name}</h3>
                <p className="text-[10px] text-myntra-gray dark:text-gray-405 truncate">{profile?.email || user?.email}</p>
              </div>
            </div>

            {/* Menu List Buttons */}
            <div className="flex flex-col gap-1 text-xs font-bold text-myntra-dark dark:text-gray-300">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2.5 px-3 py-3.5 rounded text-left transition-colors ${activeTab === 'orders' ? 'bg-rose-50/50 dark:bg-rose-950/20 text-myntra-pink' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
              >
                <ClipboardList size={16} /> <span>Order History</span>
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-2.5 px-3 py-3.5 rounded text-left transition-colors ${activeTab === 'details' ? 'bg-rose-50/50 dark:bg-rose-950/20 text-myntra-pink' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
              >
                <User size={16} /> <span>Profile Details</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center gap-2.5 px-3 py-3.5 rounded text-left transition-colors ${activeTab === 'addresses' ? 'bg-rose-50/50 dark:bg-rose-950/20 text-myntra-pink' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
              >
                <MapPin size={16} /> <span>Saved Addresses</span>
              </button>
            </div>
          </div>

          {/* RIGHT: TAB CONTENT DISPLAY PANEL */}
          <div className="lg:col-span-9 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-6 md:p-8 shadow-xs min-h-[500px]">
            
            {/* TABS: ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-sm font-extrabold uppercase text-myntra-dark dark:text-white pb-3 border-b border-gray-105 dark:border-gray-805">Your Order History</h2>

                {orderLoading && orders.length === 0 ? (
                  <div className="py-20 text-center text-xs text-myntra-gray"><RefreshCw className="animate-spin text-myntra-pink mx-auto mb-2" /> Loading orders history...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20">
                    <ClipboardList size={40} className="text-myntra-gray dark:text-gray-650 mx-auto mb-3" />
                    <p className="text-xs text-myntra-gray dark:text-gray-400 font-bold uppercase">No orders placed yet</p>
                    <button onClick={() => navigate('/catalog')} className="mt-4 px-5 py-2 bg-myntra-pink text-white text-[10px] font-bold uppercase rounded">Go Shop Catalog</button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {orders.map((order) => {
                      const isExpanded = expandedOrderId === order._id;

                      return (
                        <div 
                          key={order._id}
                          className="border border-gray-150 dark:border-gray-800 rounded-lg overflow-hidden transition-all bg-white dark:bg-gray-900"
                        >
                          {/* Order Header Summary strip */}
                          <div 
                            onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                            className="bg-gray-50/50 dark:bg-gray-800/30 p-4 flex flex-wrap justify-between items-center gap-3 cursor-pointer select-none text-xs"
                          >
                            <div className="flex gap-4 flex-wrap">
                              <div>
                                <p className="text-myntra-gray font-bold uppercase text-[9px]">Order ID</p>
                                <p className="font-bold text-myntra-dark dark:text-white truncate max-w-[150px]">{order._id}</p>
                              </div>
                              <div>
                                <p className="text-myntra-gray font-bold uppercase text-[9px]">Placed On</p>
                                <p className="font-semibold text-myntra-dark dark:text-gray-200">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                              </div>
                              <div>
                                <p className="text-myntra-gray font-bold uppercase text-[9px]">Total Amount</p>
                                <p className="font-bold text-myntra-pink">₹{order.totalPrice}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 text-[9px] font-extrabold uppercase border rounded-full tracking-wider ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus.replace('_', ' ')}
                              </span>
                              {isExpanded ? <ChevronUp size={16} className="text-myntra-gray" /> : <ChevronDown size={16} className="text-myntra-gray" />}
                            </div>
                          </div>

                          {/* Expanded Order detail breakdown */}
                          {isExpanded && (
                            <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800 space-y-6 animate-fade-in text-xs">
                              
                              {/* Order Items list */}
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-myntra-gray mb-1.5">Package Items</h4>
                                {order.orderItems.map((item, idx) => (
                                  <div key={idx} className="flex gap-4 items-center">
                                    <img src={item.image} alt={item.title} className="w-10 h-14 object-cover object-top rounded bg-gray-50 flex-shrink-0 border border-gray-100 dark:border-gray-800" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-extrabold text-[11px] text-myntra-dark dark:text-white uppercase truncate">{item.brand}</p>
                                      <p className="text-[10px] text-myntra-gray dark:text-gray-400 truncate mt-0.5">{item.title}</p>
                                      <p className="text-[10px] text-myntra-gray dark:text-gray-500 font-semibold mt-1">Size: {item.selectedSize} | Color: {item.selectedColor} | Qty: {item.quantity}</p>
                                    </div>
                                    <span className="font-bold text-myntra-dark dark:text-white">₹{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Order Tracking History Timeline */}
                              <div className="bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-5 rounded-lg space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-myntra-gray flex items-center gap-1"><Clock size={12} /> Package Tracking History</h4>
                                
                                <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-800 space-y-5">
                                  {order.trackingHistory.map((evt, idx) => (
                                    <div key={idx} className="relative">
                                      {/* Dot point */}
                                      <div className="absolute -left-[31px] top-0.5 bg-myntra-pink border border-white dark:border-gray-900 rounded-full w-2.5 h-2.5" />
                                      
                                      <div className="flex justify-between items-baseline gap-2">
                                        <p className="font-extrabold text-[11px] text-myntra-dark dark:text-white uppercase">{evt.status.replace('_', ' ')}</p>
                                        <span className="text-[9px] text-myntra-gray">{new Date(evt.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                      </div>
                                      <p className="text-[10px] text-myntra-gray dark:text-gray-400 mt-1">{evt.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Billing breakdown + Shipping Address block */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div>
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-myntra-gray mb-1.5">Shipping Address</h4>
                                  <p className="font-bold text-myntra-dark dark:text-white">{order.shippingAddress.name}</p>
                                  <p className="text-myntra-gray dark:text-gray-400 mt-0.5">{order.shippingAddress.street}</p>
                                  <p className="text-myntra-gray dark:text-gray-400 mt-0.5">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}</p>
                                  <p className="text-myntra-gray dark:text-gray-400 font-semibold mt-2">Phone: {order.shippingAddress.phone}</p>
                                </div>

                                <div className="space-y-1.5">
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-myntra-gray mb-1.5">Billing Summary</h4>
                                  <div className="flex justify-between text-[11px] text-myntra-gray dark:text-gray-400">
                                    <span>Items Original Subtotal</span>
                                    <span>₹{order.itemsPrice}</span>
                                  </div>
                                  <div className="flex justify-between text-[11px] text-myntra-gray dark:text-gray-400">
                                    <span>Saved Discounts</span>
                                    <span>-₹{order.discountPrice}</span>
                                  </div>
                                  <div className="flex justify-between text-[11px] text-myntra-gray dark:text-gray-400">
                                    <span>Taxes & Fees</span>
                                    <span>₹{order.taxPrice}</span>
                                  </div>
                                  <div className="flex justify-between text-[11px] text-myntra-gray dark:text-gray-400">
                                    <span>Convenience Shipping</span>
                                    <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
                                  </div>
                                  <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                                  <div className="flex justify-between font-bold text-myntra-dark dark:text-white text-xs">
                                    <span>Grand Total paid</span>
                                    <span className="text-myntra-pink">₹{order.totalPrice}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Returns trigger */}
                              {order.orderStatus === 'Delivered' && (
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-850 flex justify-end">
                                  <button
                                    onClick={() => handleReturnRequest(order._id)}
                                    className="px-6 py-2 border border-myntra-pink text-myntra-pink hover:bg-myntra-pink hover:text-white text-[10px] font-bold uppercase rounded tracking-wider transition-colors"
                                  >
                                    Request Return / Exchange
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TABS: PROFILE DETAILS EDIT */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <h2 className="text-sm font-extrabold uppercase text-myntra-dark dark:text-white pb-3 border-b border-gray-105 dark:border-gray-805">Account & Style Preferences</h2>

                <form onSubmit={handleProfileUpdate} className="space-y-5 max-w-xl text-xs text-myntra-dark dark:text-gray-200">
                  {profileSuccess && <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded">Style details updated successfully!</p>}

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-myntra-gray">Full Name</label>
                    <input
                      type="text" required
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none focus:border-myntra-pink"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-myntra-gray">Email Address</label>
                    <input
                      type="email" required
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none focus:border-myntra-pink"
                    />
                  </div>

                  <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />

                  {/* AI Style Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase text-myntra-dark dark:text-white flex items-center gap-1.5">
                      <Gift size={16} className="text-myntra-pink" /> AI Recommendation Settings
                    </h3>
                    
                    {/* Gender Preference */}
                    <div className="space-y-2">
                      <label className="font-semibold text-myntra-gray">Preferred Catalog Section</label>
                      <div className="flex gap-3">
                        {['Men', 'Women', 'Kids', 'Unisex'].map((gender) => (
                          <button
                            key={gender}
                            type="button"
                            onClick={() => setGenderPref(gender)}
                            className={`px-4 py-1.5 border rounded-full font-semibold transition-all ${genderPref === gender ? 'bg-myntra-dark dark:bg-white text-white dark:text-myntra-dark border-myntra-dark dark:border-white shadow-xs' : 'border-gray-200 dark:border-gray-700 text-myntra-gray hover:border-myntra-pink'}`}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sizing Preferences */}
                    <div className="space-y-2">
                      <label className="font-semibold text-myntra-gray">My Sizes (for filter defaults)</label>
                      <div className="flex flex-wrap gap-2">
                        {['S', 'M', 'L', 'XL', '30', '32', '34', '7', '8', '9'].map((sz) => {
                          const active = sizePref.includes(sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleSizePrefToggle(sz)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold border transition-all ${active ? 'border-myntra-pink text-myntra-pink bg-rose-50/50 dark:bg-rose-950/20' : 'border-gray-250 dark:border-gray-700 text-myntra-gray hover:border-myntra-pink'}`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-myntra-pink text-white text-xs font-bold uppercase rounded tracking-wider shadow hover:bg-rose-600 transition-colors"
                  >
                    Save Modifications
                  </button>
                </form>
              </div>
            )}

            {/* TABS: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-105 dark:border-gray-805">
                  <h2 className="text-sm font-extrabold uppercase text-myntra-dark dark:text-white">Saved Delivery Addresses</h2>
                  <button 
                    onClick={() => { setActiveTab('details'); alert('Addresses can be created on Checkout or saved in Profile editing.'); }}
                    className="px-3.5 py-1.5 border border-myntra-pink text-myntra-pink text-[10px] font-bold uppercase rounded tracking-wider"
                  >
                    Add Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-16 text-myntra-gray text-xs">No saved addresses found.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div 
                        key={addr._id}
                        className="border border-gray-150 dark:border-gray-800 rounded p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-extrabold text-xs text-myntra-dark dark:text-white uppercase">{addr.name}</span>
                            {addr.isDefault && <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Default</span>}
                          </div>
                          <p className="text-[11px] text-myntra-gray dark:text-gray-400 leading-relaxed mt-1">{addr.street}</p>
                          <p className="text-[11px] text-myntra-gray dark:text-gray-400 mt-0.5">{addr.city}, {addr.state} - {addr.zip}</p>
                          <p className="text-[11px] text-myntra-gray dark:text-gray-400 font-semibold mt-2.5">Mobile: {addr.phone}</p>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-850 pt-3 mt-4">
                          <button
                            disabled={addrDeleteLoading === addr._id}
                            onClick={() => handleAddrDelete(addr._id)}
                            className="text-[10px] font-bold text-red-500 uppercase hover:underline disabled:opacity-50"
                          >
                            {addrDeleteLoading === addr._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
