import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Async Thunks
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, orderData, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const payOrder = createAsyncThunk(
  'orders/pay',
  async ({ orderId, paymentResult }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${orderId}/pay`, paymentResult, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/myorders`, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const returnOrder = createAsyncThunk(
  'orders/return',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${orderId}/return`, {}, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    orderDetails: null,
    loading: false,
    success: false, // flag for order placement success
    error: null,
  },
  reducers: {
    resetOrderFlags: (state) => {
      state.success = false;
      state.error = null;
    },
    clearOrderDetails: (state) => {
      state.orderDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => { state.loading = true; state.success = false; state.error = null; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orderDetails = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.success = false; })
      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => { state.loading = true; })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => { state.loading = false; state.orderDetails = action.payload; })
      .addCase(fetchOrderDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Pay Order
      .addCase(payOrder.fulfilled, (state, action) => {
        state.orderDetails = action.payload;
      })
      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; })
      .addCase(fetchMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Return Order
      .addCase(returnOrder.fulfilled, (state, action) => {
        state.orderDetails = action.payload;
        // Update item in local list
        state.orders = state.orders.map(o => o._id === action.payload._id ? action.payload : o);
      });
  }
});

export const { resetOrderFlags, clearOrderDetails } = orderSlice.actions;
export default orderSlice.reducer;
