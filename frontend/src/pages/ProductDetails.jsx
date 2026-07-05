import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Heart, ShoppingBag, Star, ShieldCheck, RefreshCw, Truck, ArrowRight, Sparkles, MessageCircle, AlertCircle
} from 'lucide-react';
import { 
  fetchProductById, fetchSimilarProducts, fetchOutfitSuggestions, createProductReview, clearProductDetails 
} from '../redux/slices/productSlice.js';
import { toggleWishlist } from '../redux/slices/wishlistSlice.js';
import { addToCart } from '../redux/slices/cartSlice.js';
import ProductCard from '../components/ProductCard.jsx';
import api from '../api';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { product, similar, outfitSuggestions, loading } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  // User input states
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Zoom Ref & State
  const zoomRef = useRef(null);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  useEffect(() => {
    dispatch(clearProductDetails());
    dispatch(fetchProductById(id));
    dispatch(fetchSimilarProducts(id));
    dispatch(fetchOutfitSuggestions(id));
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, dispatch]);

  // Sync active default image when product loads
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setActiveImage(product.images[0]);
      if (product.colors && product.colors.length > 0) setSelectedColor(product.colors[0]);
    }
  }, [product]);

  if (loading && !product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-20 text-center flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-myntra-pink" size={32} />
        <span className="text-sm font-bold text-myntra-dark dark:text-gray-200">Loading collection...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-20 text-center">
        <p className="text-sm font-bold text-myntra-dark dark:text-gray-200">Product not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-myntra-pink text-white text-xs font-bold rounded uppercase">
          Go Back Home
        </button>
      </div>
    );
  }

  const discountAmount = Math.round((product.price * (product.discountPercentage || 0)) / 100);
  const finalPrice = Math.round(product.price - discountAmount);
  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  // Zoom Handlers
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%' // Zoom level
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  // Add to Cart
  const handleAddToBag = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    if (!selectedColor) {
      setColorError(true);
      return;
    }
    setColorError(false);

    dispatch(addToCart({
      product: product._id,
      title: product.title,
      brand: product.brand,
      image: product.images[0],
      price: product.price,
      discountPercentage: product.discountPercentage,
      quantity: 1,
      selectedSize,
      selectedColor,
      inventory: product.inventory
    }));

    // Trigger visual notification or navigate
    navigate('/cart');
  };

  const handleWishlistToggle = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!comment.trim()) {
      setReviewError('Review comments cannot be empty.');
      return;
    }

    try {
      const action = await dispatch(createProductReview({ productId: product._id, rating, comment }));
      if (createProductReview.fulfilled.match(action)) {
        setComment('');
        setReviewSuccess(true);
        // Reload details to sync aggregates
        dispatch(fetchProductById(product._id));
      } else {
        setReviewError(action.payload || 'Failed to submit review.');
      }
    } catch (err) {
      setReviewError(err.message);
    }
  };

  return (
    <div className="pb-16 bg-white dark:bg-[#0f111a] transition-colors duration-200">
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">
        
        {/* Breadcrumb */}
        <p className="text-xs text-myntra-gray dark:text-gray-400 mb-6 font-semibold uppercase tracking-wider">
          Home / {product.gender} / {product.category?.name} / {product.brand}
        </p>

        {/* Product core specs layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left panel: Image galleries */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            
            {/* Vertical thumbnails */}
            <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto no-scrollbar gap-3 md:w-20 flex-shrink-0">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-20 md:w-20 md:h-24 rounded border overflow-hidden flex-shrink-0 transition-all ${activeImage === img ? 'border-myntra-pink ring-1 ring-myntra-pink' : 'border-gray-200 dark:border-gray-800'}`}
                >
                  <img src={img} alt={`Thumb ${index}`} className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>

            {/* Large active display with zoom */}
            <div className="relative flex-1 aspect-[3/4] border border-gray-150 dark:border-gray-850 rounded overflow-hidden bg-gray-50 dark:bg-gray-950">
              <img
                src={activeImage}
                alt={product.title}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full h-full object-cover object-top cursor-zoom-in"
              />

              {/* Hover Zoom panel */}
              <div 
                style={zoomStyle}
                className="absolute inset-0 pointer-events-none z-30 border border-gray-250 bg-no-repeat rounded shadow-inner"
              />

              {/* Discount Badge */}
              {product.discountPercentage > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded shadow">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Right panel: Details details details */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title / Brand */}
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-myntra-dark dark:text-white uppercase tracking-tight mb-1">{product.brand}</h1>
              <p className="text-sm text-myntra-gray dark:text-gray-400 font-semibold">{product.title}</p>
              
              {/* Ratings line */}
              {product.ratings > 0 && (
                <div className="flex items-center gap-2 mt-3.5 border border-gray-200 dark:border-gray-800/80 w-fit px-3 py-1 rounded-full text-xs font-bold text-myntra-dark dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50">
                  <span className="flex items-center gap-0.5">
                    {product.ratings.toFixed(1)} <Star size={12} fill="currentColor" className="text-yellow-500" />
                  </span>
                  <span className="text-gray-300 dark:text-gray-700">|</span>
                  <span className="text-myntra-gray dark:text-gray-400 font-normal">{product.numReviews} Ratings</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-gray-800" />

            {/* Price tag */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl font-extrabold text-myntra-dark dark:text-white">₹{finalPrice}</span>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-sm line-through text-myntra-gray dark:text-gray-500">MRP ₹{product.price}</span>
                    <span className="text-sm font-extrabold text-red-500 dark:text-red-400">({product.discountPercentage}% OFF)</span>
                  </>
                )}
              </div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">inclusive of all taxes</p>
            </div>

            {/* Colors Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-myntra-dark dark:text-gray-200">Select Color: <span className="font-extrabold text-myntra-pink">{selectedColor}</span></h3>
                  {colorError && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10} /> Choose color</span>}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => { setSelectedColor(color); setColorError(false); }}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${selectedColor === color ? 'bg-myntra-dark dark:bg-white text-white dark:text-myntra-dark border-myntra-dark dark:border-white shadow-sm font-bold' : 'border-gray-200 dark:border-gray-800 text-myntra-gray hover:border-myntra-pink'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-myntra-dark dark:text-gray-200">Select Size: <span className="font-extrabold text-myntra-pink">{selectedSize}</span></h3>
                {sizeError && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10} /> Choose size</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => { setSelectedSize(sz); setSizeError(false); }}
                    className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${selectedSize === sz ? 'border-myntra-pink text-myntra-pink bg-rose-50/50 dark:bg-rose-950/20 shadow-xs ring-1 ring-myntra-pink' : 'border-gray-200 dark:border-gray-800 text-myntra-gray hover:border-myntra-pink hover:text-myntra-dark'}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleAddToBag}
                disabled={product.inventory === 0}
                className="flex-1 bg-myntra-pink hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider py-3.5 rounded flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <ShoppingBag size={16} /> Add to bag
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`flex-1 border text-xs font-extrabold uppercase tracking-wider py-3.5 rounded flex items-center justify-center gap-2 transition-all ${isWishlisted ? 'border-myntra-dark dark:border-white bg-myntra-dark dark:bg-white text-white dark:text-myntra-dark shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-myntra-pink text-myntra-dark dark:text-gray-200'}`}
              >
                <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                {isWishlisted ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>

            {/* Features details list */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-b border-gray-100 dark:border-gray-800/80 py-4 text-[10px] text-myntra-gray dark:text-gray-400 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2"><Truck size={16} className="text-myntra-pink" /> <span>Free Shipping</span></div>
              <div className="flex items-center gap-2"><RefreshCw size={16} className="text-myntra-pink" /> <span>14-Day Returns</span></div>
              <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-myntra-pink" /> <span>Secure Payment</span></div>
            </div>

            {/* Product Details info */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-myntra-dark dark:text-gray-250">Product Description</h3>
              <p className="text-xs text-myntra-gray dark:text-gray-400 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* --- AI MIX & MATCH OUTFIT SUGGESTIONS PANEL --- */}
        {outfitSuggestions.length > 0 && (
          <section className="mt-16 bg-gradient-to-r from-pink-50/40 via-red-50/20 to-orange-50/20 dark:from-pink-950/10 dark:via-orange-950/5 dark:to-zinc-950/5 p-6 md:p-8 rounded-xl border border-pink-100/50 dark:border-pink-900/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-myntra-pink animate-pulse" size={24} />
                <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-myntra-dark dark:text-white">AI Outfit Suggestions</h2>
                <span className="bg-gradient-to-r from-myntra-pink to-orange-500 text-white text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded">MIX & MATCH</span>
              </div>
              <span className="text-[10px] text-myntra-gray dark:text-gray-400 font-semibold italic">Complete the Look</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {outfitSuggestions.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}

        {/* --- CUSTOMER RATINGS & REVIEWS SECTION --- */}
        <section className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-12 border-t border-gray-100 dark:border-gray-800">
          
          {/* Review form / stats summary */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-md font-bold uppercase text-myntra-dark dark:text-white flex items-center gap-1.5">
              <MessageCircle size={18} className="text-myntra-pink" /> Customer Feedback
            </h2>

            {/* Average score big banner */}
            <div className="bg-myntra-light/40 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80 p-6 rounded-lg text-center">
              <p className="text-4xl font-extrabold text-myntra-dark dark:text-white">{product.ratings.toFixed(1)}</p>
              <div className="flex justify-center my-1.5 text-yellow-500">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(product.ratings) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <p className="text-[11px] text-myntra-gray dark:text-gray-400 font-semibold uppercase tracking-wider">{product.numReviews} Verified Reviews</p>
            </div>

            {/* Write a review Form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4 border border-gray-100 dark:border-gray-800 p-5 rounded-lg">
                <h3 className="text-xs font-bold uppercase text-myntra-dark dark:text-gray-200">Rate this product</h3>
                
                {reviewSuccess && <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded">Review added successfully!</p>}
                {reviewError && <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded">{reviewError}</p>}

                {/* Rating selection stars */}
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`hover:scale-115 transition-transform ${rating >= num ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      <Star size={24} fill={rating >= num ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>

                {/* Comments box */}
                <textarea
                  placeholder="Share your shopping experience with other buyers..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded text-xs outline-none focus:border-myntra-pink h-24 text-myntra-dark dark:text-gray-200"
                />

                <button
                  type="submit"
                  className="w-full py-2 bg-myntra-dark dark:bg-white text-white dark:text-myntra-dark font-extrabold text-xs uppercase tracking-wider rounded shadow hover:bg-myntra-pink hover:text-white transition-colors"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="border border-dashed border-gray-200 dark:border-gray-800 p-6 text-center rounded-lg">
                <p className="text-xs text-myntra-gray dark:text-gray-400">Please login to write review feedback.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-3 px-4 py-1.5 bg-myntra-pink text-white text-[10px] font-bold uppercase rounded"
                >
                  Login
                </button>
              </div>
            )}
          </div>

          {/* Reviews list panel */}
          <div className="lg:col-span-7 space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-myntra-dark dark:text-gray-150">Customer Reviews ({product.numReviews})</h2>
            
            {/* Fetch list or show blank */}
            <ProductReviewsList productId={product._id} />
          </div>
        </section>

        {/* --- SIMILAR PRODUCTS CAROUSEL SECTION --- */}
        {similar.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-100 dark:border-gray-800">
            <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-myntra-dark dark:text-white mb-6">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {similar.slice(0, 6).map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

// Sub-component to fetch reviews list dynamically
const ProductReviewsList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${productId}/reviews`);
        setReviews(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) loadReviews();
  }, [productId]);

  if (loading) return <div className="text-xs text-myntra-gray py-4">Loading reviews...</div>;
  if (reviews.length === 0) return <div className="text-xs text-myntra-gray/70 py-8 text-center italic border border-dashed border-gray-100 dark:border-gray-800/80 rounded">Be the first to review this product!</div>;

  return (
    <div className="space-y-4">
      {reviews.map((rev) => (
        <div key={rev._id} className="border-b border-gray-100 dark:border-gray-800/60 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              {/* Stars badge */}
              <div className="flex items-center gap-0.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                <span>{rev.rating}</span> <Star size={8} fill="currentColor" />
              </div>
              <span className="text-xs font-bold text-myntra-dark dark:text-gray-200">{rev.name}</span>
            </div>
            <span className="text-[10px] text-myntra-gray">{new Date(rev.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-myntra-gray dark:text-gray-400 mt-1.5 leading-relaxed">{rev.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductDetails;
