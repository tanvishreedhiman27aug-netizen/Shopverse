import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

const API_URL = '/auth';

// Helper to get auth header
const getAuthHeader = (getState) => {
  const token = getState().auth.token || localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_URL}/signup`, { name, email, password });
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (googlePayload, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_URL}/google`, googlePayload);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/me`, getAuthHeader(getState));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const response = await api.put(`${API_URL}/me`, profileData, getAuthHeader(getState));
      localStorage.setItem('userInfo', JSON.stringify({ ...JSON.parse(localStorage.getItem('userInfo')), ...response.data }));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Address Thunks
export const fetchAddresses = createAsyncThunk(
  'auth/fetchAddresses',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/addresses`, getAuthHeader(getState));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addAddress = createAsyncThunk(
  'auth/addAddress',
  async (addressData, { getState, rejectWithValue }) => {
    try {
      const response = await api.post(`${API_URL}/addresses`, addressData, getAuthHeader(getState));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  'auth/updateAddress',
  async ({ addressId, addressData }, { getState, rejectWithValue }) => {
    try {
      const response = await api.put(`${API_URL}/addresses/${addressId}`, addressData, getAuthHeader(getState));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'auth/deleteAddress',
  async (addressId, { getState, rejectWithValue }) => {
    try {
      const response = await api.delete(`${API_URL}/addresses/${addressId}`, getAuthHeader(getState));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  user: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
  token: localStorage.getItem('token') || null,
  profile: null,
  addresses: [],
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.profile = null;
      state.addresses = [];
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Login
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Google Login
      .addCase(googleLogin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(googleLogin.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(fetchProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.user = { ...state.user, ...action.payload };
      })
      // Addresses
      .addCase(fetchAddresses.fulfilled, (state, action) => { state.addresses = action.payload; })
      .addCase(addAddress.fulfilled, (state, action) => { state.addresses = action.payload; })
      .addCase(updateAddress.fulfilled, (state, action) => { state.addresses = action.payload; })
      .addCase(deleteAddress.fulfilled, (state, action) => { state.addresses = action.payload; });
  }
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
