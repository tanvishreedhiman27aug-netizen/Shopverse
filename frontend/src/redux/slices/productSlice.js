import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';

// Async Thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const { keyword, gender, category, brand, size, color, priceRange, discount, rating, availability, sortBy, page, limit } = queryParams;
      const response = await axios.get(API_URL, {
        params: { keyword, gender, category, brand, size, color, priceRange, discount, rating, availability, sortBy, page, limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`${API_URL}/${id}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchTrendingProducts = createAsyncThunk(
  'products/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/trending`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchDealsOfTheDay = createAsyncThunk(
  'products/fetchDeals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/deals`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchNewArrivals = createAsyncThunk(
  'products/fetchNewArrivals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/new-arrivals`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSimilarProducts = createAsyncThunk(
  'products/fetchSimilar',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/similar`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchOutfitSuggestions = createAsyncThunk(
  'products/fetchOutfit',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/outfit`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createProductReview = createAsyncThunk(
  'products/createReview',
  async ({ productId, rating, comment }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_URL}/${productId}/reviews`, { rating, comment }, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  products: [],
  product: null,
  trending: [],
  deals: [],
  newArrivals: [],
  categories: [],
  similar: [],
  outfitSuggestions: [],
  page: 1,
  pages: 1,
  totalProducts: 0,
  searchHistory: JSON.parse(localStorage.getItem('searchHistory')) || [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductDetails: (state) => {
      state.product = null;
      state.similar = [];
      state.outfitSuggestions = [];
    },
    addToSearchHistory: (state, action) => {
      const query = action.payload.trim();
      if (!query) return;
      state.searchHistory = state.searchHistory.filter(h => h.toLowerCase() !== query.toLowerCase());
      state.searchHistory.unshift(query);
      if (state.searchHistory.length > 5) state.searchHistory.pop();
      localStorage.setItem('searchHistory', JSON.stringify(state.searchHistory));
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
      localStorage.removeItem('searchHistory');
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Append or replace based on whether it is page 1 or subsequent pages
        if (action.meta.arg?.page > 1) {
          // Merge items without duplicates
          const existingIds = new Set(state.products.map(p => p._id));
          const newItems = action.payload.products.filter(p => !existingIds.has(p._id));
          state.products = [...state.products, ...newItems];
        } else {
          state.products = action.payload.products;
        }
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Fetch Single Product
      .addCase(fetchProductById.pending, (state) => { state.loading = true; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.product = action.payload; })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Fetch Trending, Deals, New Arrivals, Categories
      .addCase(fetchTrendingProducts.fulfilled, (state, action) => { state.trending = action.payload; })
      .addCase(fetchDealsOfTheDay.fulfilled, (state, action) => { state.deals = action.payload; })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => { state.newArrivals = action.payload; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; })
      
      // Similar and Outfits
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => { state.similar = action.payload; })
      .addCase(fetchOutfitSuggestions.fulfilled, (state, action) => { state.outfitSuggestions = action.payload; });
  }
});

export const { clearProductDetails, addToSearchHistory, clearSearchHistory } = productSlice.actions;
export default productSlice.reducer;
