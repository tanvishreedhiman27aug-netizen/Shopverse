import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import { 
  fetchCategories, fetchTrendingProducts, fetchDealsOfTheDay, fetchNewArrivals, fetchProducts 
} from '../redux/slices/productSlice.js';

const Home = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { categories, trending, deals, newArrivals, products: recommendedProducts, loading } = useSelector((state) => state.products);

  const [countdown, setCountdown] = useState({ hours: 8, minutes: 45, seconds: 12 });

  // Countdown timer for deals
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 }; // reset
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTrendingProducts());
    dispatch(fetchDealsOfTheDay());
    dispatch(fetchNewArrivals());
  }, [dispatch]);

  // Fetch recommendations based on user preferences if logged in
  useEffect(() => {
    if (user && user.stylePreferences) {
      const preferredGender = user.stylePreferences.gender || 'Unisex';
      dispatch(fetchProducts({ gender: preferredGender, limit: 4 }));
    } else {
      // Fetch default recommendations
      dispatch(fetchProducts({ limit: 4 }));
    }
  }, [dispatch, user]);

  const featuredBrands = [
    { name: 'Nike', logo: 'N', color: 'bg-black text-white' },
    { name: 'Puma', logo: 'P', color: 'bg-red-600 text-white' },
    { name: 'Zara', logo: 'Z', color: 'bg-amber-800 text-white' },
    { name: 'Roadster', logo: 'R', color: 'bg-zinc-800 text-white' },
    { name: 'RayBan', logo: 'RB', color: 'bg-red-800 text-white' },
    { name: 'Fossil', logo: 'F', color: 'bg-emerald-800 text-white' },
    { name: 'W', logo: 'W', color: 'bg-indigo-900 text-white' }
  ];

  return (
    <div className="pb-16 bg-white dark:bg-[#0f111a] transition-colors duration-200">
      
      {/* Category circle headers */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 overflow-x-auto no-scrollbar flex items-center justify-start md:justify-center gap-6 md:gap-10 border-b border-gray-100 dark:border-gray-800/60">
        <Link to="/catalog?gender=Men" className="flex flex-col items-center group">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-850 group-hover:border-myntra-pink transition-all">
            <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=150&q=80" alt="Men" className="w-full h-full object-cover object-top" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-tight text-myntra-dark dark:text-gray-200 mt-2 group-hover:text-myntra-pink transition-colors">Men</span>
        </Link>

        <Link to="/catalog?gender=Women" className="flex flex-col items-center group">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-855 group-hover:border-myntra-pink transition-all">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Women" className="w-full h-full object-cover object-top" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-tight text-myntra-dark dark:text-gray-200 mt-2 group-hover:text-myntra-pink transition-colors">Women</span>
        </Link>

        <Link to="/catalog?gender=Kids" className="flex flex-col items-center group">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-860 group-hover:border-myntra-pink transition-all">
            <img src="https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&q=80" alt="Kids" className="w-full h-full object-cover object-center" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-tight text-myntra-dark dark:text-gray-200 mt-2 group-hover:text-myntra-pink transition-colors">Kids</span>
        </Link>

        {categories.slice(0, 4).map((cat) => (
          <Link key={cat._id} to={`/catalog?category=${cat.slug}`} className="flex flex-col items-center group">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-myntra-light dark:bg-gray-850 flex items-center justify-center border border-gray-200 dark:border-gray-800 group-hover:border-myntra-pink transition-all overflow-hidden text-lg font-bold text-myntra-pink">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                cat.name.charAt(0)
              )}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-tight text-myntra-dark dark:text-gray-200 mt-2 group-hover:text-myntra-pink transition-colors">{cat.name}</span>
          </Link>
        ))}
      </div>

      {/* Hero Carousel */}
      <HeroCarousel />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-12 space-y-16">
        
        {/* Section: Deals of the Day */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wider text-myntra-dark dark:text-white">Deals of the Day</h2>
              <span className="bg-red-500 text-white text-[10px] font-extrabold tracking-widest px-2 py-0.5 rounded shadow-sm">HOT</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-myntra-dark dark:text-gray-300">
              <span className="text-myntra-gray dark:text-gray-400">Ends in:</span>
              <span className="bg-myntra-dark dark:bg-gray-800 text-white px-2 py-0.5 rounded font-mono text-xs">{String(countdown.hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span className="bg-myntra-dark dark:bg-gray-800 text-white px-2 py-0.5 rounded font-mono text-xs">{String(countdown.minutes).padStart(2, '0')}m</span>
              <span>:</span>
              <span className="bg-myntra-dark dark:bg-gray-800 text-white px-2 py-0.5 rounded font-mono text-xs text-myntra-pink">{String(countdown.seconds).padStart(2, '0')}s</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {deals && deals.length > 0 ? (
              deals.slice(0, 4).map((product) => <ProductCard key={product._id} product={product} />)
            ) : loading ? (
              Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <div className="col-span-full text-center text-xs text-myntra-gray py-8">No deals available today</div>
            )}
          </div>
        </section>

        {/* Section: Dynamic AI Recommendations */}
        <section className="bg-gradient-to-r from-rose-50/50 to-orange-50/30 dark:from-rose-950/10 dark:to-orange-950/5 p-6 md:p-8 rounded-xl border border-rose-100/50 dark:border-rose-900/10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-myntra-pink animate-pulse" size={24} />
            <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wider text-myntra-dark dark:text-white">
              {user ? 'Your Style Picks' : 'Editor Suggestions'}
            </h2>
            <span className="bg-gradient-to-r from-myntra-pink to-orange-500 text-white text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded shadow-sm">AI POWERED</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recommendedProducts && recommendedProducts.length > 0 ? (
              recommendedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : loading ? (
              Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <div className="col-span-full text-center text-xs text-myntra-gray py-8">No personalized picks available</div>
            )}
          </div>
        </section>

        {/* Section: Trending Products */}
        <section>
          <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wider text-myntra-dark dark:text-white">Trending Now</h2>
            <Link to="/catalog?sortBy=ratings" className="text-xs font-bold text-myntra-pink hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {trending && trending.length > 0 ? (
              trending.map((product) => <ProductCard key={product._id} product={product} />)
            ) : loading ? (
              Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <div className="col-span-full text-center text-xs text-myntra-gray py-8">No trending products available</div>
            )}
          </div>
        </section>

        {/* Section: Featured Brands */}
        <section className="text-center">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-8">
            <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wider text-myntra-dark dark:text-white">Featured Brands</h2>
          </div>
          <div className="overflow-x-auto no-scrollbar flex items-center justify-start md:justify-center gap-6 md:gap-8 pb-4">
            {featuredBrands.map((brand) => (
              <Link 
                key={brand.name} 
                to={`/catalog?brand=${brand.name}`} 
                className="flex flex-col items-center group flex-shrink-0"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl font-extrabold border-2 border-gray-250 dark:border-gray-800 ${brand.color} shadow-md group-hover:scale-105 group-hover:border-myntra-pink transition-all`}>
                  {brand.logo}
                </div>
                <span className="text-[11px] md:text-xs font-bold text-myntra-dark dark:text-gray-200 mt-2 group-hover:text-myntra-pink transition-colors">{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Section: New Arrivals */}
        <section>
          <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wider text-myntra-dark dark:text-white">New Arrivals</h2>
            <Link to="/catalog?sortBy=newest" className="text-xs font-bold text-myntra-pink hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals && newArrivals.length > 0 ? (
              newArrivals.slice(0, 4).map((product) => <ProductCard key={product._id} product={product} />)
            ) : loading ? (
              Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <div className="col-span-full text-center text-xs text-myntra-gray py-8">No new arrivals available</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
