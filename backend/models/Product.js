import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  images: [{ type: String, required: true }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  gender: { type: String, enum: ['Men', 'Women', 'Kids', 'Unisex'], required: true },
  sizes: [{ type: String, required: true }],
  colors: [{ type: String, required: true }],
  inventory: { type: Number, required: true, default: 0 },
  tags: [{ type: String }],
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isDealOfTheDay: { type: Boolean, default: false }
}, { timestamps: true });

// Add text indexing for search API
productSchema.index({ title: 'text', brand: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
