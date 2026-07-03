import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

// @desc    Get dashboard metrics & sales reports
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getDashboardAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments({});

    // Calculate total revenue
    const orders = await Order.find({ isPaid: true });
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    // Sales breakdown by category (for donut charts)
    const categoryBreakdown = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);
    // Populate categories manually or using populate equivalent
    const categories = await Category.find({});
    const categoryData = categoryBreakdown.map(item => {
      const cat = categories.find(c => c._id.toString() === item._id?.toString());
      return {
        name: cat ? cat.name : 'Unknown',
        value: item.count,
        avgPrice: Math.round(item.avgPrice)
      };
    });

    // Recent 5 orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Mock Sales history for the last 6 months (Recharts requirement)
    const salesHistory = [
      { month: 'Jan', sales: totalRevenue * 0.12 + 5000, orders: Math.round(totalOrders * 0.1) + 2 },
      { month: 'Feb', sales: totalRevenue * 0.15 + 6200, orders: Math.round(totalOrders * 0.13) + 3 },
      { month: 'Mar', sales: totalRevenue * 0.18 + 7500, orders: Math.round(totalOrders * 0.15) + 4 },
      { month: 'Apr', sales: totalRevenue * 0.22 + 9100, orders: Math.round(totalOrders * 0.2) + 5 },
      { month: 'May', sales: totalRevenue * 0.25 + 11000, orders: Math.round(totalOrders * 0.22) + 6 },
      { month: 'Jun', sales: totalRevenue * 0.08 + totalRevenue * 0.05, orders: Math.round(totalOrders * 0.2) + 2 }
    ];

    res.json({
      summary: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalRevenue: Math.round(totalRevenue)
      },
      categoryData,
      recentOrders,
      salesHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const {
    title,
    brand,
    description,
    price,
    discountPercentage,
    images,
    categoryName,
    gender,
    sizes,
    colors,
    inventory,
    tags
  } = req.body;

  try {
    let category = await Category.findOne({ name: categoryName });
    if (!category) {
      // Create inline slug
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      category = await Category.create({ name: categoryName, slug });
    }

    const product = new Product({
      title,
      brand,
      description,
      price,
      discountPercentage: discountPercentage || 0,
      images: images || ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=80'],
      category: category._id,
      gender,
      sizes: sizes || ['S', 'M', 'L', 'XL'],
      colors: colors || ['Black', 'White'],
      inventory: inventory || 10,
      tags: tags || []
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const {
    title,
    brand,
    description,
    price,
    discountPercentage,
    images,
    categoryName,
    gender,
    sizes,
    colors,
    inventory,
    tags
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (categoryName) {
        let category = await Category.findOne({ name: categoryName });
        if (!category) {
          const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          category = await Category.create({ name: categoryName, slug });
        }
        product.category = category._id;
      }

      product.title = title || product.title;
      product.brand = brand || product.brand;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;
      product.discountPercentage = discountPercentage !== undefined ? discountPercentage : product.discountPercentage;
      product.images = images || product.images;
      product.gender = gender || product.gender;
      product.sizes = sizes || product.sizes;
      product.colors = colors || product.colors;
      product.inventory = inventory !== undefined ? inventory : product.inventory;
      product.tags = tags || product.tags;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { status, description } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = status;
      if (status === 'Delivered') {
        order.isPaid = true;
        if (!order.paidAt) order.paidAt = Date.now();
      }
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user role (admin/user)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const toggleUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot modify your own role' });
      }
      user.role = user.role === 'admin' ? 'user' : 'admin';
      await user.save();
      res.json({ message: 'User role updated successfully', user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name, image, parentCategory } = req.body;
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const categoryExists = await Category.findOne({ slug });

    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      image,
      parentCategory: parentCategory || null
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
