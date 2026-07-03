import express from 'express';
import {
  registerUser,
  authUser,
  googleAuthUser,
  forgotPassword,
  getUserProfile,
  updateUserProfile,
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authentication
router.post('/signup', registerUser);
router.post('/login', authUser);
router.post('/google', googleAuthUser);
router.post('/forgot-password', forgotPassword);

// Profile
router.route('/me')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Wishlist
router.route('/wishlist')
  .get(protect, getUserWishlist)
  .post(protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);

// Addresses
router.route('/addresses')
  .get(protect, getUserAddresses)
  .post(protect, addAddress);
router.route('/addresses/:addressId')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

export default router;
