import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mockkey');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
  } = req.body;

  try {
    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify inventory & update stock counts
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.title} not found` });
      }
      if (product.inventory < item.quantity) {
        return res.status(400).json({ message: `Insufficient inventory for ${item.title}. Only ${product.inventory} left.` });
      }
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Deduct inventory
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inventory: -item.quantity }
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Allow user who made it or admin to access
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request order return
// @route   PUT /api/orders/:id/return
// @access  Private
export const requestOrderReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (order.orderStatus !== 'Delivered') {
        return res.status(400).json({ message: 'Only delivered orders can be returned' });
      }

      order.orderStatus = 'Return_Requested';
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/orders/stripe-intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
  const { amount } = req.body; // in cents or standard currency (INR/USD)

  try {
    // If it's the mock secret key, return a mock client secret
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_mock')) {
      return res.json({
        clientSecret: `pi_mock_intent_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
        isMock: true
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents/paise
      currency: 'inr',
      payment_method_types: ['card'],
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      isMock: false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
