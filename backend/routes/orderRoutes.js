import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  requestOrderReturn,
  createPaymentIntent
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems);

router.get('/myorders', protect, getMyOrders);
router.post('/stripe-intent', protect, createPaymentIntent);

router.route('/:id')
  .get(protect, getOrderById);

router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/return', protect, requestOrderReturn);

export default router;
