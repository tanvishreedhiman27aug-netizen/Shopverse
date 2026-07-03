import { createSlice } from '@reduxjs/toolkit';

const calcPrices = (state) => {
  // Original subtotal
  state.itemsPrice = state.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Total discounts
  state.discountPrice = state.cartItems.reduce((acc, item) => {
    const itemDiscount = (item.price * (item.discountPercentage || 0) / 100) * item.quantity;
    return acc + itemDiscount;
  }, 0);

  // Apply Coupon Code discount if any
  state.couponDiscount = 0;
  if (state.couponCode) {
    if (state.couponCode.toUpperCase() === 'MYNTRA200') {
      // Flat 200 off
      state.couponDiscount = Math.min(200, state.itemsPrice - state.discountPrice);
    } else if (state.couponCode.toUpperCase() === 'FASHION20') {
      // Extra 20% off on discounted total
      state.couponDiscount = (state.itemsPrice - state.discountPrice) * 0.20;
    }
  }

  // Tax (12% of discounted price)
  state.taxPrice = Math.round((state.itemsPrice - state.discountPrice - state.couponDiscount) * 0.12);

  // Shipping charges (Free over 999, else 99)
  const netTotal = state.itemsPrice - state.discountPrice - state.couponDiscount;
  state.shippingPrice = netTotal > 999 || netTotal === 0 ? 0 : 99;

  // Final Total
  state.totalPrice = Math.round(netTotal + state.taxPrice + state.shippingPrice);

  // Round values
  state.itemsPrice = Math.round(state.itemsPrice);
  state.discountPrice = Math.round(state.discountPrice);
  state.couponDiscount = Math.round(state.couponDiscount);

  // Persist
  localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
  localStorage.setItem('couponCode', state.couponCode || '');
};

const initialState = {
  cartItems: JSON.parse(localStorage.getItem('cartItems')) || [],
  itemsPrice: 0,
  discountPrice: 0,
  taxPrice: 0,
  shippingPrice: 0,
  couponCode: localStorage.getItem('couponCode') || '',
  couponDiscount: 0,
  totalPrice: 0,
};

// Initial run
const preState = { ...initialState };
calcPrices(preState);

const cartSlice = createSlice({
  name: 'cart',
  initialState: preState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      // Key contains productID + size + color so they are treated as distinct cart rows
      const existItem = state.cartItems.find(
        (x) => x.product === item.product && x.selectedSize === item.selectedSize && x.selectedColor === item.selectedColor
      );

      if (existItem) {
        // Increment quantity up to inventory
        existItem.quantity = Math.min(existItem.quantity + item.quantity, item.inventory);
      } else {
        state.cartItems.push(item);
      }
      calcPrices(state);
    },
    updateCartItemQuantity: (state, action) => {
      const { product, selectedSize, selectedColor, quantity } = action.payload;
      const existItem = state.cartItems.find(
        (x) => x.product === product && x.selectedSize === selectedSize && x.selectedColor === selectedColor
      );
      if (existItem) {
        existItem.quantity = quantity;
      }
      calcPrices(state);
    },
    removeFromCart: (state, action) => {
      const { product, selectedSize, selectedColor } = action.payload;
      state.cartItems = state.cartItems.filter(
        (x) => !(x.product === product && x.selectedSize === selectedSize && x.selectedColor === selectedColor)
      );
      calcPrices(state);
    },
    applyCoupon: (state, action) => {
      state.couponCode = action.payload;
      calcPrices(state);
    },
    removeCoupon: (state) => {
      state.couponCode = '';
      calcPrices(state);
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.couponCode = '';
      calcPrices(state);
    }
  }
});

export const { addToCart, updateCartItemQuantity, removeFromCart, applyCoupon, removeCoupon, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
