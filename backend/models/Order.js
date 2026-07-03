import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  brand: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  selectedSize: { type: String, required: true },
  selectedColor: { type: String, required: true }
}, { _id: false });

const trackingEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  description: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  shippingAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: { type: String, required: true, enum: ['COD', 'Online'], default: 'Online' },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  discountPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  orderStatus: {
    type: String,
    required: true,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Return_Requested'],
    default: 'Processing'
  },
  trackingHistory: [trackingEventSchema]
}, { timestamps: true });

// Pre-save hook to add the initial tracking history event if not present
orderSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('orderStatus')) {
    const defaultDescriptions = {
      'Processing': 'Your order has been placed and is being processed.',
      'Shipped': 'Your package has been shipped and is on its way.',
      'Delivered': 'Order has been successfully delivered.',
      'Cancelled': 'Order was cancelled.',
      'Return_Requested': 'A request to return this order has been submitted.',
      'Returned': 'Order has been returned and refunded.'
    };
    this.trackingHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
      description: defaultDescriptions[this.orderStatus] || `Order status updated to ${this.orderStatus}.`
    });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
