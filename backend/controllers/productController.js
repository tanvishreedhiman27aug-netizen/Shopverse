import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';

// @desc    Fetch all products with advanced filters & search
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Text search or keyword match
    if (req.query.keyword) {
      query.$text = { $search: req.query.keyword };
    }

    // Gender Filter
    if (req.query.gender) {
      const genders = req.query.gender.split(',');
      query.gender = { $in: genders };
    }

    // Category Filter
    if (req.query.category) {
      const categories = req.query.category.split(',');
      // Find category documents by name or slug
      const categoryDocs = await Category.find({
        $or: [{ name: { $in: categories } }, { slug: { $in: categories } }]
      });
      const categoryIds = categoryDocs.map(c => c._id);
      query.category = { $in: categoryIds };
    }

    // Brand Filter
    if (req.query.brand) {
      const brands = req.query.brand.split(',');
      query.brand = { $in: brands.map(b => new RegExp('^' + b + '$', 'i')) };
    }

    // Sizes Filter
    if (req.query.size) {
      const sizes = req.query.size.split(',');
      query.sizes = { $in: sizes };
    }

    // Colors Filter
    if (req.query.color) {
      const colors = req.query.color.split(',');
      query.colors = { $in: colors.map(c => new RegExp('^' + c + '$', 'i')) };
    }

    // Price Range Filter
    if (req.query.priceRange) {
      const [min, max] = req.query.priceRange.split('-').map(Number);
      query.price = {};
      if (!isNaN(min)) query.price.$gte = min;
      if (!isNaN(max)) query.price.$lte = max;
    }

    // Discount Filter
    if (req.query.discount) {
      const minDiscount = parseFloat(req.query.discount);
      if (!isNaN(minDiscount)) {
        query.discountPercentage = { $gte: minDiscount };
      }
    }

    // Ratings Filter
    if (req.query.rating) {
      const minRating = parseFloat(req.query.rating);
      if (!isNaN(minRating)) {
        query.ratings = { $gte: minRating };
      }
    }

    // Availability Filter
    if (req.query.availability === 'inStock') {
      query.inventory = { $gt: 0 };
    } else if (req.query.availability === 'outOfStock') {
      query.inventory = 0;
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'priceAsc':
          sort = { price: 1 };
          break;
        case 'priceDesc':
          sort = { price: -1 };
          break;
        case 'ratings':
          sort = { ratings: -1 };
          break;
        case 'discount':
          sort = { discountPercentage: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If authenticated user, push to recentlyViewed log
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          user.recentlyViewed = user.recentlyViewed.filter(id => id.toString() !== product._id.toString());
          user.recentlyViewed.unshift(product._id);
          // Keep recentlyViewed capped at 10 items
          if (user.recentlyViewed.length > 10) user.recentlyViewed.pop();
          await user.save();
        }
      } catch (e) {
        // Continue silently if JWT decoding fails in public endpoint
      }
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
export const getTrendingProducts = async (req, res) => {
  try {
    // Trending = Highest rating + Featured items
    const products = await Product.find({})
      .populate('category', 'name slug')
      .sort({ ratings: -1, numReviews: -1 })
      .limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get deals of the day
// @route   GET /api/products/deals
// @access  Public
export const getDealsOfTheDay = async (req, res) => {
  try {
    const products = await Product.find({ isDealOfTheDay: true })
      .populate('category', 'name slug')
      .limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
export const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    AI Fashion Recommendation Engine - Outfit Suggester (Mix & Match)
// @route   GET /api/products/:id/outfit
// @access  Public
export const getOutfitRecommendations = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const currentCatName = product.category.name.toLowerCase();
    const gender = product.gender;

    // Define complementary outfit logic based on categories
    // e.g. Tops -> suggest Bottoms, Footwear, Accessories
    // Bottoms -> suggest Tops, Footwear, Accessories
    // Footwear -> suggest Tops, Bottoms, Accessories
    let matchCategories = [];
    if (currentCatName.includes('shirt') || currentCatName.includes('t-shirt') || currentCatName.includes('top') || currentCatName.includes('kurta')) {
      matchCategories = ['bottomwear', 'trousers', 'jeans', 'footwear', 'accessories'];
    } else if (currentCatName.includes('jeans') || currentCatName.includes('pants') || currentCatName.includes('trousers') || currentCatName.includes('skirt') || currentCatName.includes('shorts')) {
      matchCategories = ['tops', 'shirts', 't-shirts', 'footwear', 'accessories'];
    } else {
      matchCategories = ['tops', 'bottomwear', 'footwear', 'accessories'];
    }

    // Find category ObjectIDs matching these keywords
    const regexQueries = matchCategories.map(catName => new RegExp(catName, 'i'));
    const categories = await Category.find({ name: { $in: regexQueries } });
    const categoryIds = categories.map(c => c._id);

    // Find recommendation candidates with same gender and matching categories
    const candidates = await Product.find({
      _id: { $ne: product._id },
      gender: { $in: [gender, 'Unisex'] },
      category: { $in: categoryIds }
    }).populate('category');

    // Simple rule-based ranking: Rank candidates by shared tags and brands
    const recommendations = candidates
      .map(item => {
        let score = 0;
        // Shared tags
        const sharedTags = item.tags.filter(tag => product.tags.includes(tag));
        score += sharedTags.length * 2;
        // Brand alignment
        if (item.brand.toLowerCase() === product.brand.toLowerCase()) {
          score += 3;
        }
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item)
      .slice(0, 4); // return top 4 outfit suggestions

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get similar products
// @route   GET /api/products/:id/similar
// @access  Public
export const getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Query similar items: same category, same gender, different ID
    const similar = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      gender: product.gender
    })
    .populate('category')
    .limit(6);

    res.json(similar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = await Review.findOne({
        product: product._id,
        user: req.user._id
      });

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed by you' });
      }

      const review = await Review.create({
        product: product._id,
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      });

      // Update product rating aggregation
      const reviews = await Review.find({ product: product._id });
      product.numReviews = reviews.length;
      product.ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added successfully', review });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CATEGORY CONTROLLERS

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).populate('parentCategory');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
