import express from 'express';
import {
  getProducts,
  getProductById,
  getTrendingProducts,
  getDealsOfTheDay,
  getNewArrivals,
  getOutfitRecommendations,
  getSimilarProducts,
  createProductReview,
  getProductReviews,
  getCategories
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// General Lists
router.get('/', getProducts);
router.get('/trending', getTrendingProducts);
router.get('/deals', getDealsOfTheDay);
router.get('/new-arrivals', getNewArrivals);
router.get('/categories', getCategories);

// Single Product Details & recommendations
router.get('/:id', getProductById);
router.get('/:id/outfit', getOutfitRecommendations);
router.get('/:id/similar', getSimilarProducts);

// Product Reviews
router.route('/:id/reviews')
  .get(getProductReviews)
  .post(protect, createProductReview);

export default router;
