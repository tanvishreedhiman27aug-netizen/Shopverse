import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { fetchOrderDetails } from '../redux/slices/orderSlice.js';

const OrderSuccess = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { orderDetails, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
  }, [id, dispatch]);

  return (
    <div className="min-h-[85vh] bg-white dark:bg-[#0f111a] py-16 flex items-center justify-center transition-colors duration-200">
      <div className="max-w-[700px] w-full mx-auto px-4 md:px-8 text-center space-y-8">
        
        {/* Animated Celebration checkmark */}
        <div className="space-y-3">
          <div className="inline-block p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full border border-emerald-250 animate-bounce">
            <CheckCircle size={48} fill="currentColor" className="text-white dark:text-gray-900" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-myntra-dark dark:text-white">
            Order Confirmed!
          </h1>
          <p className="text-xs text-myntra-gray dark:text-gray-400 font-semibold max-w-sm mx-auto leading-relaxed">
            Thank you for shopping with us. Your order has been registered and is now being packaged.
          </p>
        </div>

        {/* Order Details Overview */}
        {loading ? (
          <div className="py-8 text-xs text-myntra-gray">Syncing order details...</div>
        ) : orderDetails ? (
          <div className="border border-gray-150 dark:border-gray-800 p-5 rounded-lg text-left bg-gray-50/50 dark:bg-gray-900/50 max-w-md mx-auto text-xs space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-2">
              <span className="font-extrabold uppercase tracking-wider text-myntra-gray text-[10px]">Receipt details</span>
              <span className="font-bold text-myntra-pink">{orderDetails._id}</span>
            </div>
            
            <div className="space-y-1.5 text-myntra-dark dark:text-gray-300">
              <p>• <span className="font-semibold text-myntra-gray">Total Paid</span>: ₹{orderDetails.totalPrice}</p>
              <p>• <span className="font-semibold text-myntra-gray">Payment Method</span>: {orderDetails.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Stripe Online'}</p>
              <p>• <span className="font-semibold text-myntra-gray">Delivery Name</span>: {orderDetails.shippingAddress.name}</p>
              <p>• <span className="font-semibold text-myntra-gray">Phone contact</span>: {orderDetails.shippingAddress.phone}</p>
            </div>
          </div>
        ) : null}

        {/* Action navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto pt-4">
          <Link
            to="/profile"
            className="flex-1 px-6 py-3 border border-myntra-dark dark:border-white text-myntra-dark dark:text-gray-200 text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 hover:bg-myntra-dark hover:text-white dark:hover:bg-white dark:hover:text-myntra-dark transition-colors shadow-xs"
          >
            <Truck size={14} /> Track Package
          </Link>
          <Link
            to="/"
            className="flex-1 px-6 py-3 bg-myntra-pink text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 hover:bg-rose-600 transition-colors shadow"
          >
            <ShoppingBag size={14} /> Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
