import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, X, Grid, List, ChevronDown, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import { fetchProducts } from '../redux/slices/productSlice.js';
import useInfiniteScroll from '../hooks/useInfiniteScroll.js';

const Catalog = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { products, page, pages, loading, totalProducts } = useSelector((state) => state.products);

  // Filters State
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState('');
  const [minDiscount, setMinDiscount] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // UI state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Lists for static check selections
  const brandsList = ['Roadster', 'Puma', 'Levis', 'Nike', 'Zara', 'Hugo Boss', 'RayBan', 'Fossil', 'W', 'U.S. Polo'];
  const categoriesList = ['Tops', 'Bottomwear', 'Jackets', 'Dresses', 'Footwear', 'Accessories', 'Beauty'];
  const sizesList = ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '7', '8', '9', '10', '100ml', 'Standard'];
  const colorsList = ['Black', 'White', 'Blue', 'Navy Blue', 'Olive Green', 'Red', 'Grey', 'Brown', 'Yellow', 'Pink', 'Gold', 'Maroon', 'Oud', 'Multi-color'];
  const priceRanges = [
    { label: 'Under ₹1,000', value: '0-1000' },
    { label: '₹1,000 - ₹2,000', value: '1000-2000' },
    { label: '₹2,000 - ₹5,000', value: '2000-5000' },
    { label: 'Above ₹5,000', value: '5000-99999' }
  ];

  // Helper to load state from URL
  const loadFiltersFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    setSelectedGenders(params.get('gender') ? params.get('gender').split(',') : []);
    setSelectedCategories(params.get('category') ? params.get('category').split(',') : []);
    setSelectedBrands(params.get('brand') ? params.get('brand').split(',') : []);
    setSelectedSizes(params.get('size') ? params.get('size').split(',') : []);
    setSelectedColors(params.get('color') ? params.get('color').split(',') : []);
    setPriceRange(params.get('priceRange') || '');
    setMinDiscount(params.get('discount') || '');
    setMinRating(params.get('rating') || '');
    setSortBy(params.get('sortBy') || 'newest');
  }, [location.search]);

  // Sync URL params to filter state on load
  useEffect(() => {
    loadFiltersFromURL();
  }, [loadFiltersFromURL]);

  // Trigger search fetch when URL parameters change (fetches Page 1)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryParams = {
      keyword: params.get('keyword') || '',
      gender: params.get('gender') || '',
      category: params.get('category') || '',
      brand: params.get('brand') || '',
      size: params.get('size') || '',
      color: params.get('color') || '',
      priceRange: params.get('priceRange') || '',
      discount: params.get('discount') || '',
      rating: params.get('rating') || '',
      sortBy: params.get('sortBy') || 'newest',
      page: 1,
      limit: 8
    };
    dispatch(fetchProducts(queryParams));
  }, [location.search, dispatch]);

  // Infinite Scroll Trigger (fetches subsequent pages)
  const loadMore = useCallback(() => {
    if (page < pages && !loading) {
      const params = new URLSearchParams(location.search);
      const queryParams = {
        keyword: params.get('keyword') || '',
        gender: params.get('gender') || '',
        category: params.get('category') || '',
        brand: params.get('brand') || '',
        size: params.get('size') || '',
        color: params.get('color') || '',
        priceRange: params.get('priceRange') || '',
        discount: params.get('discount') || '',
        rating: params.get('rating') || '',
        sortBy: params.get('sortBy') || 'newest',
        page: page + 1,
        limit: 8
      };
      dispatch(fetchProducts(queryParams));
    }
  }, [page, pages, loading, location.search, dispatch]);

  const infiniteScrollRef = useInfiniteScroll(loadMore, page < pages, loading);

  // Sync URL when filter values are updated
  const applyFilters = (updates = {}) => {
    const params = new URLSearchParams();
    
    // Maintain keyword search query
    const currentKeyword = new URLSearchParams(location.search).get('keyword');
    if (currentKeyword) params.set('keyword', currentKeyword);

    const genders = updates.gender !== undefined ? updates.gender : selectedGenders;
    const categories = updates.category !== undefined ? updates.category : selectedCategories;
    const brands = updates.brand !== undefined ? updates.brand : selectedBrands;
    const sizes = updates.size !== undefined ? updates.size : selectedSizes;
    const colors = updates.color !== undefined ? updates.color : selectedColors;
    const price = updates.priceRange !== undefined ? updates.priceRange : priceRange;
    const discount = updates.discount !== undefined ? updates.discount : minDiscount;
    const rating = updates.rating !== undefined ? updates.rating : minRating;
    const sort = updates.sortBy !== undefined ? updates.sortBy : sortBy;

    if (genders.length > 0) params.set('gender', genders.join(','));
    if (categories.length > 0) params.set('category', categories.join(','));
    if (brands.length > 0) params.set('brand', brands.join(','));
    if (sizes.length > 0) params.set('size', sizes.join(','));
    if (colors.length > 0) params.set('color', colors.join(','));
    if (price) params.set('priceRange', price);
    if (discount) params.set('discount', discount);
    if (rating) params.set('rating', rating);
    if (sort) params.set('sortBy', sort);

    navigate(`/catalog?${params.toString()}`);
  };

  const handleGenderToggle = (val) => {
    const list = selectedGenders.includes(val) 
      ? selectedGenders.filter(g => g !== val) 
      : [...selectedGenders, val];
    setSelectedGenders(list);
    applyFilters({ gender: list });
  };

  const handleCategoryToggle = (val) => {
    const list = selectedCategories.includes(val)
      ? selectedCategories.filter(c => c !== val)
      : [...selectedCategories, val];
    setSelectedCategories(list);
    applyFilters({ category: list });
  };

  const handleBrandToggle = (val) => {
    const list = selectedBrands.includes(val)
      ? selectedBrands.filter(b => b !== val)
      : [...selectedBrands, val];
    setSelectedBrands(list);
    applyFilters({ brand: list });
  };

  const handleSizeToggle = (val) => {
    const list = selectedSizes.includes(val)
      ? selectedSizes.filter(s => s !== val)
      : [...selectedSizes, val];
    setSelectedSizes(list);
    applyFilters({ size: list });
  };

  const handleColorToggle = (val) => {
    const list = selectedColors.includes(val)
      ? selectedColors.filter(c => c !== val)
      : [...selectedColors, val];
    setSelectedColors(list);
    applyFilters({ color: list });
  };

  const clearAllFilters = () => {
    setSelectedGenders([]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange('');
    setMinDiscount('');
    setMinRating('');
    
    // Clear URL except keyword
    const keyword = new URLSearchParams(location.search).get('keyword');
    navigate(keyword ? `/catalog?keyword=${keyword}` : `/catalog`);
  };

  const keywordHeader = new URLSearchParams(location.search).get('keyword');

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f111a] py-6 transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Header Breadcrumb & Results Count */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 gap-2">
          <div>
            <h1 className="text-sm font-bold text-myntra-dark dark:text-gray-200">
              Home / {keywordHeader ? `Search: "${keywordHeader}"` : 'Catalog'}
            </h1>
            <p className="text-xs text-myntra-gray dark:text-gray-400 mt-1">
              Found <span className="font-bold text-myntra-dark dark:text-gray-200">{totalProducts}</span> items
            </p>
          </div>

          <div className="flex items-center gap-4 justify-between md:justify-end">
            {/* View Mode controls */}
            <div className="hidden sm:flex items-center border border-gray-200 dark:border-gray-800 rounded overflow-hidden">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-myntra-light dark:bg-gray-850 text-myntra-pink font-bold' : 'text-myntra-gray'}`}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-myntra-light dark:bg-gray-850 text-myntra-pink font-bold' : 'text-myntra-gray'}`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Sort selection dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-myntra-gray dark:text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); applyFilters({ sortBy: e.target.value }); }}
                className="text-xs font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded outline-none cursor-pointer focus:border-myntra-pink text-myntra-dark dark:text-gray-200"
              >
                <option value="newest">New Arrivals</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="ratings">Customer Rating</option>
                <option value="discount">Better Discounts</option>
              </select>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-myntra-pink text-white text-xs font-bold rounded uppercase tracking-wider shadow-sm"
            >
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        {/* Main layout: Sidebar + Grid */}
        <div className="flex items-start gap-8">
          
          {/* LEFT SIDEBAR: FILTERS (DESKTOP) */}
          <aside className="hidden md:block w-[260px] flex-shrink-0 sticky top-28 max-h-[80vh] overflow-y-auto pr-2 border-r border-gray-100 dark:border-gray-800/60 pb-8 scrollbar-thin">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-myntra-dark dark:text-gray-150">Filters</h2>
              <button 
                onClick={clearAllFilters}
                className="text-[10px] font-bold text-myntra-pink uppercase hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Genders filter section */}
            <div className="py-4 border-b border-gray-100 dark:border-gray-800/60 space-y-2">
              <h3 className="text-xs font-bold uppercase text-myntra-dark dark:text-gray-200 mb-2">Gender</h3>
              {['Men', 'Women', 'Kids', 'Unisex'].map(gender => (
                <label key={gender} className="flex items-center gap-2.5 text-xs text-myntra-gray dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedGenders.includes(gender)}
                    onChange={() => handleGenderToggle(gender)}
                    className="accent-myntra-pink w-3.5 h-3.5"
                  />
                  <span>{gender}</span>
                </label>
              ))}
            </div>

            {/* Categories filter section */}
            <div className="py-4 border-b border-gray-100 dark:border-gray-800/60 space-y-2">
              <h3 className="text-xs font-bold uppercase text-myntra-dark dark:text-gray-200 mb-2">Categories</h3>
              {categoriesList.map(cat => (
                <label key={cat} className="flex items-center gap-2.5 text-xs text-myntra-gray dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="accent-myntra-pink w-3.5 h-3.5"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>

            {/* Brands filter section */}
            <div className="py-4 border-b border-gray-100 dark:border-gray-800/60 space-y-2">
              <h3 className="text-xs font-bold uppercase text-myntra-dark dark:text-gray-200 mb-2">Brand</h3>
              {brandsList.map(brand => (
                <label key={brand} className="flex items-center gap-2.5 text-xs text-myntra-gray dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className="accent-myntra-pink w-3.5 h-3.5"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>

            {/* Price Ranges filter section */}
            <div className="py-4 border-b border-gray-100 dark:border-gray-800/60 space-y-2">
              <h3 className="text-xs font-bold uppercase text-myntra-dark dark:text-gray-200 mb-2">Price</h3>
              {priceRanges.map(range => (
                <label key={range.value} className="flex items-center gap-2.5 text-xs text-myntra-gray dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="priceRangeRadio"
                    checked={priceRange === range.value}
                    onChange={() => { setPriceRange(range.value); applyFilters({ priceRange: range.value }); }}
                    className="accent-myntra-pink w-3.5 h-3.5"
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>

            {/* Sizes filter section */}
            <div className="py-4 border-b border-gray-100 dark:border-gray-800/60 space-y-2">
              <h3 className="text-xs font-bold uppercase text-myntra-dark dark:text-gray-200 mb-2">Size</h3>
              <div className="flex flex-wrap gap-1">
                {sizesList.map(sz => (
                  <button
                    key={sz}
                    onClick={() => handleSizeToggle(sz)}
                    className={`px-2 py-1 text-[10px] font-semibold border rounded transition-colors ${selectedSizes.includes(sz) ? 'border-myntra-pink text-myntra-pink bg-rose-50/50 dark:bg-rose-950/20' : 'border-gray-200 dark:border-gray-800 text-myntra-gray hover:border-myntra-pink'}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors filter section */}
            <div className="py-4 border-b border-gray-100 dark:border-gray-800/60 space-y-2">
              <h3 className="text-xs font-bold uppercase text-myntra-dark dark:text-gray-200 mb-2">Colors</h3>
              <div className="flex flex-wrap gap-1.5">
                {colorsList.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorToggle(color)}
                    className={`px-2.5 py-1 text-[10px] font-semibold border rounded-full transition-colors ${selectedColors.includes(color) ? 'border-myntra-pink text-white bg-myntra-pink' : 'border-gray-200 dark:border-gray-800 text-myntra-gray hover:border-myntra-pink bg-white dark:bg-gray-900'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Discounts filter section */}
            <div className="py-4 border-b border-gray-100 dark:border-gray-800/60 space-y-2">
              <h3 className="text-xs font-bold uppercase text-myntra-dark dark:text-gray-200 mb-2">Discount</h3>
              {[10, 20, 35, 50].map(disc => (
                <label key={disc} className="flex items-center gap-2.5 text-xs text-myntra-gray dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="discountRadio"
                    checked={minDiscount === String(disc)}
                    onChange={() => { setMinDiscount(String(disc)); applyFilters({ discount: String(disc) }); }}
                    className="accent-myntra-pink w-3.5 h-3.5"
                  />
                  <span>{disc}% and above</span>
                </label>
              ))}
            </div>

            {/* Ratings filter section */}
            <div className="py-4 space-y-2">
              <h3 className="text-xs font-bold uppercase text-myntra-dark dark:text-gray-200 mb-2">Customer Rating</h3>
              {[4, 3, 2].map(rt => (
                <label key={rt} className="flex items-center gap-2.5 text-xs text-myntra-gray dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="ratingRadio"
                    checked={minRating === String(rt)}
                    onChange={() => { setMinRating(String(rt)); applyFilters({ rating: String(rt) }); }}
                    className="accent-myntra-pink w-3.5 h-3.5"
                  />
                  <span>{rt}★ and above</span>
                </label>
              ))}
            </div>
          </aside>

          {/* RIGHT CONTAINER: PRODUCT GRID / LIST */}
          <main className="flex-1 w-full">
            {/* Show page 1 skeletons when loading and no products */}
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-sm font-bold text-myntra-dark dark:text-gray-200">No products found matching your filters.</p>
                <p className="text-xs text-myntra-gray mt-1">Try modifying your search text or removing filters.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-5 py-2 bg-myntra-pink text-white text-xs font-bold rounded uppercase tracking-wider shadow"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div>
                {/* View render: Grid or List */}
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" 
                  : "flex flex-col gap-4"
                }>
                  {products.map((product) => (
                    <div key={product._id} className={viewMode === 'list' ? 'flex bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded p-4 gap-6' : ''}>
                      {viewMode === 'list' ? (
                        <>
                          <div className="w-28 h-36 flex-shrink-0 overflow-hidden bg-gray-50 dark:bg-gray-950 rounded">
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover object-top" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-extrabold text-sm text-myntra-dark dark:text-white uppercase">{product.brand}</h3>
                              <p className="text-xs text-myntra-gray dark:text-gray-400 mt-0.5">{product.title}</p>
                              <p className="text-[11px] text-myntra-gray dark:text-gray-500 mt-2 line-clamp-2 max-w-[500px]">{product.description}</p>
                            </div>
                            <div className="flex items-baseline gap-2 mt-4">
                              <span className="text-sm font-bold text-myntra-dark dark:text-white">₹{Math.round(product.price * (1 - (product.discountPercentage || 0)/100))}</span>
                              {product.discountPercentage > 0 && (
                                <span className="text-xs line-through text-myntra-gray">₹{product.price}</span>
                              )}
                              <span className="text-xs font-bold text-myntra-pink">({product.discountPercentage}% OFF)</span>
                            </div>
                            <div className="mt-3">
                              <button 
                                onClick={() => navigate(`/product/${product._id}`)}
                                className="px-4 py-1.5 border border-myntra-pink text-myntra-pink text-xs font-bold rounded uppercase hover:bg-myntra-pink hover:text-white transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <ProductCard product={product} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom Observer Loader target element */}
                <div 
                  ref={infiniteScrollRef}
                  className="w-full py-12 flex justify-center items-center"
                >
                  {loading && page > 1 && (
                    <div className="flex items-center gap-2 text-myntra-pink font-bold text-xs">
                      <RefreshCw className="animate-spin" size={16} />
                      <span>Loading more fashion picks...</span>
                    </div>
                  )}
                  {!hasMoreProducts() && products.length > 0 && (
                    <span className="text-xs text-myntra-gray uppercase tracking-widest font-bold">
                      You've viewed all products
                    </span>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTERS SIDE DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="w-[85%] max-w-[340px] h-full bg-white dark:bg-gray-900 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
                <h2 className="text-sm font-extrabold uppercase text-myntra-dark dark:text-gray-100">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1">
                  <X size={20} className="text-myntra-dark dark:text-gray-100" />
                </button>
              </div>

              {/* Duplicate Filter Widgets for Mobile view */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase text-myntra-dark dark:text-gray-200">Gender</h3>
                  {['Men', 'Women', 'Kids', 'Unisex'].map(gender => (
                    <label key={gender} className="flex items-center gap-2.5 text-xs text-myntra-gray dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedGenders.includes(gender)}
                        onChange={() => handleGenderToggle(gender)}
                        className="accent-myntra-pink w-3.5 h-3.5"
                      />
                      <span>{gender}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase text-myntra-dark dark:text-gray-200">Categories</h3>
                  {categoriesList.map(cat => (
                    <label key={cat} className="flex items-center gap-2.5 text-xs text-myntra-gray dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                        className="accent-myntra-pink w-3.5 h-3.5"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase text-myntra-dark dark:text-gray-200">Price</h3>
                  {priceRanges.map(range => (
                    <label key={range.value} className="flex items-center gap-2.5 text-xs text-myntra-gray dark:text-gray-300">
                      <input
                        type="radio"
                        name="priceRangeRadioMobile"
                        checked={priceRange === range.value}
                        onChange={() => { setPriceRange(range.value); applyFilters({ priceRange: range.value }); }}
                        className="accent-myntra-pink w-3.5 h-3.5"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-8 flex gap-3">
              <button 
                onClick={() => { clearAllFilters(); setMobileFiltersOpen(false); }}
                className="flex-1 py-2 border border-gray-200 dark:border-gray-700 text-xs font-bold text-myntra-dark dark:text-gray-200 uppercase rounded"
              >
                Reset
              </button>
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2 bg-myntra-pink text-white text-xs font-bold uppercase rounded shadow"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function hasMoreProducts() {
    return page < pages;
  }
};

export default Catalog;
