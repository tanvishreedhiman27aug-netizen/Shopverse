import express from 'express';
import {
  getDashboardAnalytics,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminUsers,
  toggleUserRole,
  createCategory
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect & admin middleware to all admin routes
router.use(protect, admin);

router.get('/analytics', getDashboardAnalytics);

// Product CRUD
router.post('/products', createProduct);
router.route('/products/:id')
  .put(updateProduct)
  .delete(deleteProduct);

// Category creation
router.post('/categories', createCategory);

// Orders
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Users
router.get('/users', getAdminUsers);
router.put('/users/:id/role', toggleUserRole);

export default router;
