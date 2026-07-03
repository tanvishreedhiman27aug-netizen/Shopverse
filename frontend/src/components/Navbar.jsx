import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Search, User, Heart, ShoppingBag, Mic, MicOff, Sun, Moon, Menu, X, Trash2, ArrowLeft 
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice.js';
import { addToSearchHistory, clearSearchHistory } from '../redux/slices/productSlice.js';
import useVoiceSearch from '../hooks/useVoiceSearch.js';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { searchHistory } = useSelector((state) => state.products);

  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const suggestionRef = useRef(null);

  // Auto-suggestions list matching products tags
  const trendingSearches = ['Shirt', 'Jeans', 'Sneakers', 'Dress', 'Kurta', 'Leather Jacket', 'Perfume'];
  const [suggestions, setSuggestions] = useState([]);

  // Voice Search Result Callback
  const handleVoiceResult = (text) => {
    setQuery(text);
    triggerSearch(text);
  };

  const { isListening, startListening, stopListening, supported: voiceSupported } = useVoiceSearch(handleVoiceResult);

  // Sync Dark Mode Class
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Handle clicking outside suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync Search Query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword');
    if (keyword) setQuery(keyword);
    else if (location.pathname !== '/catalog') setQuery('');
  }, [location]);

  // Generate real-time auto-suggestions
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const filtered = trendingSearches.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  }, [query]);

  const triggerSearch = (searchQuery) => {
    const q = searchQuery || query;
    if (q.trim()) {
      dispatch(addToSearchHistory(q));
      setShowSuggestions(false);
      setMobileSearchOpen(false);
      navigate(`/catalog?keyword=${encodeURIComponent(q)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  const handleSuggestionClick = (val) => {
    setQuery(val);
    triggerSearch(val);
  };

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f111a]/95 backdrop-blur-md border-b border-gray-150 dark:border-gray-800 shadow-myntra transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between h-20">
        
        {/* Left: Mobile Menu Trigger + Logo */}
        <div className="flex items-center space-x-4">
          <button 
            className="md:hidden p-2 text-myntra-dark dark:text-gray-250 hover:text-myntra-pink transition-colors" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="flex items-center space-x-2">
            {/* Custom Premium Geometric SVG Logo matching Myntra signature shape & colors */}
            <svg viewBox="0 0 100 100" className="w-9 h-9 transform hover:scale-105 transition-transform duration-300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 85V15L50 52.5L85 15V85" stroke="url(#myntraLogoGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="myntraLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff3f6c" />
                  <stop offset="35%" stopColor="#ff563f" />
                  <stop offset="70%" stopColor="#f4c430" />
                  <stop offset="100%" stopColor="#ec008c" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xl font-black tracking-widest text-[#282c3f] dark:text-white font-sans hidden sm:block">
              MYNTRA
            </span>
          </Link>
        </div>

        {/* Middle: Horizontal Category Links (Hidden on Mobile) */}
        <div className="hidden md:flex h-full space-x-6 lg:space-x-8 text-[13px] font-extrabold uppercase tracking-wider text-myntra-dark dark:text-gray-200">
          <Link 
            to="/catalog?gender=Men" 
            className="relative h-full flex items-center hover:text-myntra-pink transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-[4px] after:bg-myntra-pink after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
          >
            Men
          </Link>
          <Link 
            to="/catalog?gender=Women" 
            className="relative h-full flex items-center hover:text-myntra-pink transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-[4px] after:bg-myntra-pink after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
          >
            Women
          </Link>
          <Link 
            to="/catalog?gender=Kids" 
            className="relative h-full flex items-center hover:text-myntra-pink transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-[4px] after:bg-myntra-pink after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
          >
            Kids
          </Link>
          <Link 
            to="/catalog?category=Footwear" 
            className="relative h-full flex items-center hover:text-myntra-pink transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-[4px] after:bg-myntra-pink after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
          >
            Footwear
          </Link>
          <Link 
            to="/catalog?category=Accessories" 
            className="relative h-full flex items-center hover:text-myntra-pink transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-[4px] after:bg-myntra-pink after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
          >
            Accessories
          </Link>
          <Link 
            to="/catalog?category=Beauty" 
            className="relative h-full flex items-center hover:text-myntra-pink transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-[4px] after:bg-myntra-pink after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
          >
            Beauty
          </Link>
        </div>

        {/* Right: Search Box + Action Icons */}
        <div className="flex items-center space-x-6 lg:space-x-8 flex-1 md:flex-initial justify-end">
          
          {/* Search Box (Desktop) */}
          <div className="hidden md:block relative w-[250px] lg:w-[400px]" ref={suggestionRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-12 py-2.5 text-xs bg-gray-100 dark:bg-gray-805 text-myntra-dark dark:text-gray-100 placeholder-myntra-gray dark:placeholder-gray-400 rounded-md border border-transparent focus:border-gray-250 dark:focus:border-gray-700 outline-none focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 shadow-inner"
              />
              <Search className="absolute left-3.5 top-3.5 text-myntra-gray" size={14} />
              
              <button 
                onClick={isListening ? stopListening : startListening}
                className={`absolute right-3 top-2.5 p-1 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-myntra-gray hover:text-myntra-pink'}`}
                title={isListening ? 'Listening... click to stop' : 'Search by voice'}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            </div>

            {/* Suggestions & Search History Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-myntra-hover rounded-md overflow-hidden z-50 animate-fade-in">
                
                {/* Voice Status Alert */}
                {isListening && (
                  <div className="p-3 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 text-center animate-pulse border-b border-gray-100 dark:border-gray-800 font-bold">
                    Listening to your voice... Speak clearly.
                  </div>
                )}

                {/* Real-time suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] uppercase font-bold text-myntra-gray px-2 mb-1.5">Suggested Keywords</p>
                    {suggestions.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleSuggestionClick(item)}
                        className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 text-myntra-dark dark:text-gray-200 rounded transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}

                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between px-2 mb-1.5">
                      <p className="text-[10px] uppercase font-bold text-myntra-gray">Recent Searches</p>
                      <button 
                        onClick={() => dispatch(clearSearchHistory())}
                        className="text-[9px] text-red-500 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Trash2 size={10} /> Clear
                      </button>
                    </div>
                    {searchHistory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        <button
                          onClick={() => handleSuggestionClick(item)}
                          className="flex-1 text-left px-2.5 py-1.5 text-xs text-myntra-dark dark:text-gray-200 transition-colors"
                        >
                          {item}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Trending searches */}
                {suggestions.length === 0 && searchHistory.length === 0 && (
                  <div className="p-3">
                    <p className="text-[10px] uppercase font-bold text-myntra-gray px-1 mb-2">Trending Searches</p>
                    <div className="flex flex-wrap gap-1.5">
                      {trendingSearches.map((item) => (
                        <button
                          key={item}
                          onClick={() => handleSuggestionClick(item)}
                          className="px-3 py-1 text-xs bg-myntra-light dark:bg-gray-800 text-myntra-dark dark:text-gray-200 hover:text-myntra-pink rounded-full transition-colors font-semibold"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-6 lg:space-x-8 text-myntra-dark dark:text-gray-200">
            
            {/* Search Toggle (Mobile) */}
            <button 
              className="md:hidden p-1 text-myntra-dark dark:text-gray-200 hover:text-myntra-pink transition-colors" 
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Open search overlay"
            >
              <Search size={20} />
            </button>

            {/* Profile / Login Dropdown */}
            <div className="relative group py-5">
              <Link 
                to={user ? "/profile" : "/login"} 
                className="flex flex-col items-center cursor-pointer hover:text-myntra-pink transition-colors group/icon"
              >
                <User size={20} className="group-hover/icon:scale-105 transition-transform" />
                <span className="text-[10px] font-extrabold mt-1 hidden md:block">
                  {user ? "Profile" : "Login"}
                </span>
              </Link>

              {/* Myntra-style dropdown menu */}
              <div className="absolute right-0 top-full mt-0 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-myntra-hover rounded-md overflow-hidden hidden group-hover:block z-50 animate-fade-in p-4 text-xs">
                {user ? (
                  /* Logged In Dropdown */
                  <div className="space-y-3">
                    <div className="border-b border-gray-100 dark:border-gray-800 pb-2.5">
                      <p className="font-extrabold text-myntra-dark dark:text-white text-xs truncate">Hello, {user.name}</p>
                      <p className="text-[10px] text-myntra-gray dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="flex flex-col gap-2.5 text-myntra-dark dark:text-gray-300 font-bold">
                      {user.role === 'admin' && (
                        <Link to="/admin" className="hover:text-myntra-pink transition-colors">Admin Dashboard</Link>
                      )}
                      <Link to="/profile" className="hover:text-myntra-pink transition-colors">My Orders</Link>
                      <Link to="/wishlist" className="hover:text-myntra-pink transition-colors">Wishlist</Link>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left text-red-500 hover:text-rose-600 font-extrabold transition-colors pt-2.5 border-t border-gray-100 dark:border-gray-800 mt-1"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Logged Out Dropdown */
                  <div className="space-y-3 text-left">
                    <div>
                      <p className="font-extrabold text-myntra-dark dark:text-white text-xs">Welcome</p>
                      <p className="text-[10px] text-myntra-gray dark:text-gray-400 mt-0.5">To access account and manage orders</p>
                    </div>
                    <Link 
                      to="/login"
                      className="block w-full py-2 border border-myntra-pink text-myntra-pink hover:bg-myntra-pink hover:text-white text-center font-bold uppercase rounded-sm transition-colors text-[10px]"
                    >
                      Login / Signup
                    </Link>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
                    <div className="flex flex-col gap-2.5 text-myntra-dark dark:text-gray-300 font-bold">
                      <Link to="/login?redirect=profile" className="hover:text-myntra-pink transition-colors">Orders</Link>
                      <Link to="/login?redirect=wishlist" className="hover:text-myntra-pink transition-colors">Wishlist</Link>
                      <a href="#" className="hover:text-myntra-pink transition-colors">Contact Us</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="flex flex-col items-center relative hover:text-myntra-pink transition-colors group/icon">
              <Heart size={20} className="group-hover/icon:scale-105 transition-transform" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-myntra-pink text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center scale-95 border border-white dark:border-gray-900 shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
              <span className="text-[10px] font-extrabold mt-1 hidden md:block">Wishlist</span>
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="flex flex-col items-center relative hover:text-myntra-pink transition-colors group/icon">
              <ShoppingBag size={20} className="group-hover/icon:scale-105 transition-transform" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-myntra-pink text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center scale-95 border border-white dark:border-gray-900 shadow-sm">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
              <span className="text-[10px] font-extrabold mt-1 hidden md:block">Bag</span>
            </Link>

            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 rounded-full hover:bg-myntra-light dark:hover:bg-gray-800 text-myntra-dark dark:text-gray-200 transition-colors"
              aria-label="Toggle light/dark theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- Fullscreen Mobile Search Overlay --- */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col p-4">
          <div className="flex items-center space-x-3 mb-4">
            <button onClick={() => setMobileSearchOpen(false)} className="p-1" aria-label="Back">
              <ArrowLeft size={24} className="text-myntra-dark dark:text-gray-100" />
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-4 pr-10 py-2.5 bg-myntra-light dark:bg-gray-800 text-myntra-dark dark:text-gray-100 text-sm rounded outline-none border border-transparent focus:border-myntra-pink"
              />
              <button 
                onClick={isListening ? stopListening : startListening}
                className="absolute right-3 top-2.5 p-1 rounded-full text-myntra-gray"
                aria-label="Voice search"
              >
                {isListening ? <MicOff size={16} className="text-red-500 animate-pulse" /> : <Mic size={16} />}
              </button>
            </div>
          </div>

          {isListening && (
            <div className="p-3 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 text-center animate-pulse rounded mb-4">
              Listening for keywords...
            </div>
          )}

          {/* Mobile suggestions list */}
          <div className="flex-1 overflow-y-auto">
            {suggestions.length > 0 ? (
              suggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full text-left py-3 border-b border-gray-100 dark:border-gray-800 text-sm text-myntra-dark dark:text-gray-200"
                >
                  {item}
                </button>
              ))
            ) : (
              <div>
                <p className="text-xs uppercase font-bold text-myntra-gray mb-2">Trending Searches</p>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleSuggestionClick(item)}
                      className="px-3 py-1.5 bg-myntra-light dark:bg-gray-800 text-myntra-dark dark:text-gray-200 text-xs rounded-full"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Mobile Sidebar Navigation Drawer --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300">
          <div className="absolute top-0 left-0 w-4/5 max-w-[320px] h-full bg-white dark:bg-gray-900 p-6 flex flex-col justify-between shadow-2xl animate-slide-right">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-myntra-pink to-orange-500 bg-clip-text text-transparent">
                  MYNTRA
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1" aria-label="Close mobile menu">
                  <X size={20} className="text-myntra-dark dark:text-gray-200" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex flex-col space-y-5 text-sm font-bold uppercase tracking-wider text-myntra-dark dark:text-gray-200">
                <Link to="/catalog?gender=Men" onClick={() => setMobileMenuOpen(false)} className="hover:text-myntra-pink py-1">Men</Link>
                <Link to="/catalog?gender=Women" onClick={() => setMobileMenuOpen(false)} className="hover:text-myntra-pink py-1">Women</Link>
                <Link to="/catalog?gender=Kids" onClick={() => setMobileMenuOpen(false)} className="hover:text-myntra-pink py-1">Kids</Link>
                <Link to="/catalog?category=Footwear" onClick={() => setMobileMenuOpen(false)} className="hover:text-myntra-pink py-1">Footwear</Link>
                <Link to="/catalog?category=Accessories" onClick={() => setMobileMenuOpen(false)} className="hover:text-myntra-pink py-1">Accessories</Link>
                <Link to="/catalog?category=Beauty" onClick={() => setMobileMenuOpen(false)} className="hover:text-myntra-pink py-1">Beauty</Link>
              </div>
            </div>

            {/* Profile actions at bottom */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              {user ? (
                <div>
                  <div className="mb-4">
                    <p className="text-xs font-bold text-myntra-dark dark:text-gray-200 truncate">Hello, {user.name}</p>
                    <p className="text-[10px] text-myntra-gray dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-semibold text-myntra-pink">Admin Dashboard</Link>
                  )}
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs text-myntra-dark dark:text-gray-300">My Orders</Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full mt-4 text-center py-2 bg-red-50 dark:bg-red-950/20 text-red-500 font-bold rounded text-xs"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 bg-myntra-pink text-white font-bold rounded text-xs uppercase"
                >
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
