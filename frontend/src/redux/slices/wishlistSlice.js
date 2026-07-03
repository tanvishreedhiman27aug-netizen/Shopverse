import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/wishlist';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const isInWishlist = getState().wishlist.items.some(item => item._id === productId);
      if (isInWishlist) {
        const response = await axios.delete(`${API_URL}/${productId}`, getAuthHeader());
        return response.data;
      } else {
        const response = await axios.post(API_URL, { productId }, getAuthHeader());
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchWishlist.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(toggleWishlist.fulfilled, (state, action) => { state.items = action.payload; });
  }
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
