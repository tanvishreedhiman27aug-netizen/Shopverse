import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, X, RefreshCw } from 'lucide-react';
import { fetchWishlist, toggleWishlist } from '../redux/slices/wishlistSlice.js';
import { addToCart } from '../redux/slices/cartSlice.js';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items, loading } = useSelector((state) => state.wishlist);

  // Size picker popup states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [chosenSize, setChosenSize] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(fetchWishlist());
  }, [user, dispatch, navigate]);

  const handleRemove = (productId) => {
    dispatch(toggleWishlist(productId));
  };

  const openSizePicker = (product) => {
    setSelectedProduct(product);
    setChosenSize(product.sizes[0] || 'M');
  };

  const handleMoveToBag = () => {
    if (!selectedProduct) return;

    dispatch(addToCart({
      product: selectedProduct._id,
      title: selectedProduct.title,
      brand: selectedProduct.brand,
      image: selectedProduct.images[0],
      price: selectedProduct.price,
      discountPercentage: selectedProduct.discountPercentage,
      quantity: 1,
      selectedSize: chosenSize,
      selectedColor: selectedProduct.colors[0] || 'Black',
      inventory: selectedProduct.inventory
    }));

    // Remove from wishlist
    dispatch(toggleWishlist(selectedProduct._id));
    
    // Close modal
    setSelectedProduct(null);
    setChosenSize('');
    
    navigate('/cart');
  };

  if (loading && items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-20 text-center flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-myntra-pink" size={32} />
        <span className="text-sm font-bold text-myntra-dark dark:text-gray-200">Loading your wishlist...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f111a] py-12 transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-8">
          <Heart className="text-myntra-pink" size={24} fill="currentColor" />
          <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-wider text-myntra-dark dark:text-white">
            My Wishlist <span className="font-normal text-myntra-gray text-sm">({items.length} items)</span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <Heart size={48} className="text-myntra-gray dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-md font-bold text-myntra-dark dark:text-gray-200">YOUR WISHLIST IS EMPTY</h2>
            <p className="text-xs text-myntra-gray mt-2 leading-relaxed">
              Save items that you like in your wishlist. Review them anytime and easily move them to bag.
            </p>
            <Link 
              to="/catalog"
              className="mt-6 inline-block px-8 py-3 bg-myntra-pink text-white text-xs font-bold rounded uppercase tracking-wider shadow-md hover:bg-rose-600 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {items.map((product) => {
              const discountAmount = Math.round((product.price * (product.discountPercentage || 0)) / 100);
              const finalPrice = Math.round(product.price - discountAmount);

              return (
                <div 
                  key={product._id} 
                  className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded overflow-hidden shadow-myntra hover:shadow-myntra-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Grid Area */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-gray-950">
                    <img 
                      src={product.images[0]} 
                      alt={product.title} 
                      className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-700" 
                    />
                    
                    {/* Trash Delete button */}
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="absolute top-3.5 right-3.5 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-myntra-gray hover:text-red-500 shadow-xs z-10 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 size={12} />
                    </button>

                    {/* Discount Tag */}
                    {product.discountPercentage > 0 && (
                      <span className="absolute top-3.5 left-3.5 bg-red-500 text-white font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                        {product.discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  {/* Info details Area */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-xs text-myntra-dark dark:text-white uppercase truncate">{product.brand}</h3>
                      <p className="text-[11px] text-myntra-gray dark:text-gray-400 truncate mt-0.5">{product.title}</p>
                      
                      <div className="flex items-baseline gap-1.5 mt-2 flex-wrap">
                        <span className="text-xs font-bold text-myntra-dark dark:text-gray-200">₹{finalPrice}</span>
                        {product.discountPercentage > 0 && (
                          <span className="text-[10px] line-through text-myntra-gray dark:text-gray-500">₹{product.price}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => openSizePicker(product)}
                      disabled={product.inventory === 0}
                      className="w-full mt-4 py-2 border border-myntra-pink text-myntra-pink hover:bg-myntra-pink hover:text-white disabled:bg-gray-100 disabled:text-myntra-gray disabled:border-gray-200 disabled:cursor-not-allowed text-[10px] font-bold uppercase rounded tracking-wider flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ShoppingBag size={12} />
                      {product.inventory === 0 ? 'Out of Stock' : 'Move to bag'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- QUICK SIZE PICKER MODAL DIALOG --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg max-w-xs w-full p-6 shadow-2xl relative animate-scale-up">
            
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-4 right-4 text-myntra-gray hover:text-myntra-dark dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-xs font-bold uppercase tracking-wider text-myntra-dark dark:text-gray-200 mb-4 pr-6">Select Sizing</h3>
            
            <div className="flex flex-wrap gap-2.5 mb-6">
              {selectedProduct.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setChosenSize(sz)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${chosenSize === sz ? 'border-myntra-pink text-myntra-pink bg-rose-50/50 dark:bg-rose-950/20' : 'border-gray-200 dark:border-gray-700 text-myntra-gray hover:border-myntra-pink'}`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <button
              onClick={handleMoveToBag}
              className="w-full py-2.5 bg-myntra-pink hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded shadow-md transition-colors"
            >
              Confirm & Bag Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
