import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Plus, ShieldCheck, ShoppingBag, CreditCard, ChevronRight, RefreshCw, CheckCircle 
} from 'lucide-react';
import { fetchAddresses, addAddress } from '../redux/slices/authSlice.js';
import { createOrder, resetOrderFlags } from '../redux/slices/orderSlice.js';
import { clearCart } from '../redux/slices/cartSlice.js';
import axios from 'axios';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, addresses } = useSelector((state) => state.auth);
  const { cartItems, itemsPrice, discountPrice, taxPrice, shippingPrice, couponCode, couponDiscount, totalPrice } = useSelector((state) => state.cart);
  const { loading: orderLoading, success: orderSuccess, orderDetails } = useSelector((state) => state.orders);

  // Steps
  // 1: Address, 2: Payment
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Address creation form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false
  });

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState('Online'); // Online or COD

  // Card input states (Mock Stripe Elements)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardError, setCardError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Initial load
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
      return;
    }
    if (cartItems.length === 0 && !orderSuccess) {
      navigate('/cart');
      return;
    }
    dispatch(fetchAddresses());
    dispatch(resetOrderFlags());
  }, [user, cartItems, dispatch, navigate, orderSuccess]);

  // Set default address initially
  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find(a => a.isDefault);
      setSelectedAddress(def || addresses[0]);
    }
  }, [addresses]);

  // If order is placed successfully, navigate to success or payment confirm
  useEffect(() => {
    if (orderSuccess && orderDetails) {
      const orderId = orderDetails._id;
      dispatch(clearCart());
      dispatch(resetOrderFlags());
      navigate(`/order-success/${orderId}`);
    }
  }, [orderSuccess, orderDetails, navigate, dispatch]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const action = await dispatch(addAddress(addressForm));
    if (addAddress.fulfilled.match(action)) {
      setShowAddressForm(false);
      setAddressForm({ name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false });
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a shipping address.');
      return;
    }

    const orderData = {
      orderItems: cartItems.map(item => ({
        product: item.product,
        title: item.title,
        brand: item.brand,
        image: item.image,
        price: item.price - Math.round((item.price * (item.discountPercentage || 0)) / 100),
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      })),
      shippingAddress: {
        name: selectedAddress.name,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip: selectedAddress.zip,
        phone: selectedAddress.phone
      },
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice: discountPrice + couponDiscount,
      totalPrice
    };

    if (paymentMethod === 'COD') {
      dispatch(createOrder(orderData));
    } else {
      // Online Payment integration (Stripe mock process flow)
      // Validate mock elements
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setCardError('Invalid Credit Card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setCardError('Invalid Expiration Date.');
        return;
      }
      if (cardCvv.length < 3) {
        setCardError('Invalid Security Code.');
        return;
      }
      if (!cardName.trim()) {
        setCardError('Cardholder Name is required.');
        return;
      }
      setCardError('');
      setPaymentProcessing(true);

      try {
        // Request secret from backend
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post('http://localhost:5000/api/orders/stripe-intent', { amount: totalPrice }, config);
        
        // Simulating network delay of Stripe confirmation
        setTimeout(async () => {
          // Send order create payload
          const result = await dispatch(createOrder(orderData));
          if (createOrder.fulfilled.match(result)) {
            const newOrder = result.payload;
            // Send pay update to server
            await axios.put(`http://localhost:5000/api/orders/${newOrder._id}/pay`, {
              id: response.data.clientSecret,
              status: 'succeeded',
              update_time: new Date().toISOString(),
              email_address: user.email
            }, config);

            setPaymentProcessing(false);
            dispatch(clearCart());
            navigate(`/order-success/${newOrder._id}`);
          } else {
            setCardError(result.payload || 'Failed to place order.');
            setPaymentProcessing(false);
          }
        }, 3000);

      } catch (err) {
        setCardError(err.response?.data?.message || err.message);
        setPaymentProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f111a] py-12 transition-colors duration-200">
      
      {paymentProcessing && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex flex-col items-center justify-center text-white gap-3 select-none">
          <RefreshCw className="animate-spin text-myntra-pink" size={36} />
          <p className="font-extrabold uppercase tracking-widest text-sm">Processing Stripe Payment...</p>
          <p className="text-xs text-myntra-gray dark:text-gray-400">Do not refresh page or close tab.</p>
        </div>
      )}

      <div className="max-w-[1100px] mx-auto px-4 md:px-8">
        
        {/* Checkout Header Steps navigation */}
        <div className="flex items-center justify-center gap-4 mb-10 text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={() => setStep(1)}
            className={`pb-1 border-b-2 transition-all ${step === 1 ? 'border-myntra-pink text-myntra-pink' : 'border-transparent text-myntra-gray'}`}
          >
            1. Delivery Address
          </button>
          <ChevronRight size={14} className="text-myntra-gray" />
          <button 
            disabled={!selectedAddress}
            onClick={() => setStep(2)}
            className={`pb-1 border-b-2 transition-all ${step === 2 ? 'border-myntra-pink text-myntra-pink' : 'border-transparent text-myntra-gray disabled:opacity-50'}`}
          >
            2. Payment Options
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: STEP RENDERERS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* STEP 1: ADDRESS */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold uppercase text-myntra-dark dark:text-white flex items-center gap-1.5"><MapPin size={16} /> Select Delivery Address</h2>
                  {!showAddressForm && (
                    <button 
                      onClick={() => setShowAddressForm(true)}
                      className="px-3.5 py-1.5 border border-myntra-pink text-myntra-pink hover:bg-myntra-pink hover:text-white text-[10px] font-bold uppercase rounded tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <Plus size={10} /> Add New
                    </button>
                  )}
                </div>

                {/* Add address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="border border-gray-100 dark:border-gray-800 p-5 rounded space-y-4">
                    <h3 className="text-xs font-bold uppercase text-myntra-dark dark:text-gray-200">New shipping address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input 
                        type="text" placeholder="Contact Name" required
                        value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent text-xs rounded outline-none focus:border-myntra-pink text-myntra-dark dark:text-gray-200"
                      />
                      <input 
                        type="text" placeholder="Mobile Number" required
                        value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent text-xs rounded outline-none focus:border-myntra-pink text-myntra-dark dark:text-gray-200"
                      />
                      <input 
                        type="text" placeholder="Flat, Street Address" required
                        value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent text-xs rounded outline-none focus:border-myntra-pink text-myntra-dark dark:text-gray-200 sm:col-span-2"
                      />
                      <input 
                        type="text" placeholder="City" required
                        value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent text-xs rounded outline-none focus:border-myntra-pink text-myntra-dark dark:text-gray-200"
                      />
                      <input 
                        type="text" placeholder="State" required
                        value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent text-xs rounded outline-none focus:border-myntra-pink text-myntra-dark dark:text-gray-200"
                      />
                      <input 
                        type="text" placeholder="Pincode" required
                        value={addressForm.zip} onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent text-xs rounded outline-none focus:border-myntra-pink text-myntra-dark dark:text-gray-200"
                      />
                      <label className="flex items-center gap-2 text-xs text-myntra-gray dark:text-gray-300 select-none cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="accent-myntra-pink w-3.5 h-3.5"
                        />
                        <span>Set as Default Address</span>
                      </label>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        type="button" onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-xs font-bold uppercase rounded text-myntra-dark dark:text-gray-200"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-5 py-2 bg-myntra-dark dark:bg-white text-white dark:text-myntra-dark text-xs font-bold uppercase rounded shadow"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses list cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div 
                      key={addr._id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`border rounded p-4 cursor-pointer relative shadow-xs flex flex-col justify-between transition-all ${selectedAddress?._id === addr._id ? 'border-myntra-pink ring-1 ring-myntra-pink bg-rose-50/10 dark:bg-rose-950/5' : 'border-gray-150 dark:border-gray-800'}`}
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

                      {selectedAddress?._id === addr._id && (
                        <div className="absolute bottom-4 right-4 text-myntra-pink">
                          <CheckCircle size={16} fill="currentColor" className="text-white dark:text-gray-900" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedAddress && (
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto px-8 py-3 bg-myntra-pink text-white text-xs font-bold uppercase rounded tracking-wider shadow hover:bg-rose-600 transition-colors"
                  >
                    Proceed to Payment
                  </button>
                )}
              </div>
            )}

            {/* STEP 2: PAYMENT */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-sm font-extrabold uppercase text-myntra-dark dark:text-white flex items-center gap-1.5"><CreditCard size={16} /> Choose Payment Method</h2>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('Online')}
                    className={`border p-5 rounded text-center flex flex-col items-center gap-2 cursor-pointer transition-all ${paymentMethod === 'Online' ? 'border-myntra-pink text-myntra-pink ring-1 ring-myntra-pink' : 'border-gray-200 dark:border-gray-800 text-myntra-gray'}`}
                  >
                    <CreditCard size={24} />
                    <span className="text-xs font-bold uppercase tracking-wider">Credit / Debit Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('COD')}
                    className={`border p-5 rounded text-center flex flex-col items-center gap-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-myntra-pink text-myntra-pink ring-1 ring-myntra-pink' : 'border-gray-200 dark:border-gray-800 text-myntra-gray'}`}
                  >
                    <ShoppingBag size={24} />
                    <span className="text-xs font-bold uppercase tracking-wider">Cash on Delivery</span>
                  </button>
                </div>

                {/* Card input panel (Mock Stripe Element) */}
                {paymentMethod === 'Online' && (
                  <div className="border border-gray-100 dark:border-gray-800 p-5 rounded bg-gray-50/20 dark:bg-gray-900/10 space-y-4">
                    <h3 className="text-xs font-bold uppercase text-myntra-dark dark:text-gray-200">Secure card details</h3>
                    
                    {cardError && <p className="text-xs text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 p-2 rounded">{cardError}</p>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-myntra-dark dark:text-gray-200">
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="font-semibold text-myntra-gray">Card Number</label>
                        <input
                          type="text" placeholder="1234 5678 9101 1121" required
                          value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                          maxLength={19}
                          className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none focus:border-myntra-pink"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-myntra-gray">Expiration Date</label>
                        <input
                          type="text" placeholder="MM/YY" required
                          value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').replace(/(\d{2})/, '$1/').substring(0, 5))}
                          maxLength={5}
                          className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none focus:border-myntra-pink"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-myntra-gray">CVV / Security Code</label>
                        <input
                          type="password" placeholder="123" required
                          value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                          maxLength={3}
                          className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none focus:border-myntra-pink"
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="font-semibold text-myntra-gray">Cardholder Name</label>
                        <input
                          type="text" placeholder="e.g. John Doe" required
                          value={cardName} onChange={(e) => setCardName(e.target.value)}
                          className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none focus:border-myntra-pink"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-2.5 border border-gray-200 dark:border-gray-750 text-xs font-bold uppercase rounded text-myntra-dark dark:text-gray-200"
                  >
                    Back to Address
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={orderLoading}
                    className="flex-1 bg-myntra-pink hover:bg-rose-600 disabled:bg-gray-300 text-white text-xs font-extrabold uppercase tracking-wider py-3 rounded flex items-center justify-center gap-1.5 shadow-md transition-colors"
                  >
                    {orderLoading ? 'Placing Order...' : paymentMethod === 'COD' ? 'Confirm Order (COD)' : 'Pay & Confirm Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: ORDER SUMMARY PREVIEW */}
          <div className="lg:col-span-4 border border-gray-100 dark:border-gray-800 p-5 rounded bg-white dark:bg-gray-900 shadow-xs space-y-4 sticky top-28">
            <h3 className="text-xs font-bold uppercase tracking-wider text-myntra-dark dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">Order Summary</h3>
            
            {/* Small list items scroll */}
            <div className="max-h-40 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <img src={item.image} alt={item.title} className="w-10 h-14 object-cover object-top rounded flex-shrink-0 bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-[11px] text-myntra-dark dark:text-white uppercase truncate">{item.brand}</p>
                    <p className="text-[10px] text-myntra-gray dark:text-gray-400 truncate mt-0.5">{item.title}</p>
                    <p className="text-[10px] text-myntra-gray dark:text-gray-500 font-semibold mt-1">Qty: {item.quantity} | Size: {item.selectedSize}</p>
                  </div>
                  <span className="font-bold text-myntra-dark dark:text-gray-100">₹{(item.price - Math.round((item.price * (item.discountPercentage || 0)) / 100)) * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800" />

            <div className="space-y-2 text-xs text-myntra-dark dark:text-gray-300">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{itemsPrice}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Saved Discounts</span>
                <span>-₹{discountPrice + couponDiscount}</span>
              </div>
              <div className="flex justify-between">
                <span>Convenience / GST (12%)</span>
                <span>₹{taxPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fees</span>
                <span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800" />

            <div className="flex justify-between text-sm font-extrabold text-myntra-dark dark:text-white uppercase tracking-tight">
              <span>Total Payable</span>
              <span>₹{totalPrice}</span>
            </div>

            {selectedAddress && (
              <div className="pt-2">
                <p className="text-[10px] uppercase font-bold text-myntra-gray">Shipping To:</p>
                <p className="text-[11px] text-myntra-dark dark:text-gray-350 font-bold truncate mt-1">{selectedAddress.name}</p>
                <p className="text-[10px] text-myntra-gray dark:text-gray-450 truncate mt-0.5">{selectedAddress.street}, {selectedAddress.city}</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-myntra-gray font-bold uppercase tracking-wider border-t border-gray-100 dark:border-gray-800 mt-2">
              <ShieldCheck size={16} className="text-emerald-500" /> <span>Secure Stripe / COD Escrow</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
