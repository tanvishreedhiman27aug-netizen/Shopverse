import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myntra_clone');
    console.log('Connected to DB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    console.log('Database cleared.');

    // Create Default Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@myntra.com',
      password: 'password123', // Model hook will re-hash, but let's write simple seed
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      stylePreferences: {
        gender: 'Unisex',
        preferredSizes: ['M', 'L'],
        preferredCategories: ['Tops', 'Bottomwear'],
        preferredColors: ['Black', 'Blue']
      }
    });

    const regularUser = await User.create({
      name: 'Test Customer',
      email: 'user@myntra.com',
      password: 'password123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      addresses: [
        {
          name: 'Test Customer',
          street: '123 Fashion Street, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400050',
          phone: '9876543210',
          isDefault: true
        }
      ],
      stylePreferences: {
        gender: 'Men',
        preferredSizes: ['M', 'L'],
        preferredCategories: ['Tops', 'Sneakers'],
        preferredColors: ['Navy Blue', 'White']
      }
    });

    console.log('Users seeded.');

    // Create Categories
    const categoriesData = [
      { name: 'Tops', slug: 'tops' },
      { name: 'Bottomwear', slug: 'bottomwear' },
      { name: 'Jackets', slug: 'jackets' },
      { name: 'Dresses', slug: 'dresses' },
      { name: 'Footwear', slug: 'footwear' },
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Beauty', slug: 'beauty' }
    ];

    const categoriesMap = {};
    for (const cat of categoriesData) {
      const createdCat = await Category.create(cat);
      categoriesMap[cat.name] = createdCat._id;
    }
    console.log('Categories seeded.');

    // Create Products
    const productsData = [
      // Men's Tops
      {
        title: 'Men Regular Fit Solid Casual Shirt',
        brand: 'Roadster',
        description: 'Upgrade your smart-casual dressing with this shirt from Roadster. Rendered in a solid style, this 100% cotton piece is tailored with a button-down collar and curved hem. Match it with dark wash denim and low-top canvas sneakers.',
        price: 1299,
        discountPercentage: 40,
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1621072156002-e2fcc103e869?auto=format&fit=crop&w=600&q=80'
        ],
        category: categoriesMap['Tops'],
        gender: 'Men',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Navy Blue', 'Olive Green', 'White'],
        inventory: 25,
        tags: ['shirt', 'casual', 'cotton', 'office', 'classic'],
        ratings: 4.2,
        numReviews: 12,
        isFeatured: true,
        isNewArrival: true,
        isDealOfTheDay: false
      },
      {
        title: 'Men Printed Pure Cotton T-shirt',
        brand: 'Puma',
        description: 'Style this dynamic printed crew neck t-shirt from Puma with active trackpants or street joggers. Crafted with moisture-wicking technology and premium cotton blend for all-day comfort.',
        price: 999,
        discountPercentage: 20,
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80'
        ],
        category: categoriesMap['Tops'],
        gender: 'Men',
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'Grey', 'Red'],
        inventory: 40,
        tags: ['tshirt', 'sports', 'cotton', 'gym', 'casual'],
        ratings: 4.5,
        numReviews: 28,
        isFeatured: false,
        isNewArrival: false,
        isDealOfTheDay: true
      },
      // Men's Bottomwear
      {
        title: 'Men Slim Fit Stretchable Denim Jeans',
        brand: 'Levis',
        description: 'Classic 511 slim fit stretchable jeans from Levi\'s. The perfect blend of durable denim and comfortable flexibility. Styled with a classic five-pocket design and leather patch detailing.',
        price: 3499,
        discountPercentage: 35,
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1484186139897-d5fc6b908812?auto=format&fit=crop&w=600&q=80'
        ],
        category: categoriesMap['Bottomwear'],
        gender: 'Men',
        sizes: ['30', '32', '34', '36'],
        colors: ['Blue', 'Black'],
        inventory: 15,
        tags: ['jeans', 'denim', 'slim-fit', 'stretch', 'levis'],
        ratings: 4.6,
        numReviews: 45,
        isFeatured: true,
        isNewArrival: false,
        isDealOfTheDay: false
      },
      // Jackets
      {
        title: 'Unisex Leather Biker Jacket',
        brand: 'H&M',
        description: 'Top-tier faux leather biker jacket featuring zippered details, broad notch lapels, and custom metallic hardware. Excellent for winter layering or adding edge to casual outfits.',
        price: 4999,
        discountPercentage: 50,
        images: [
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=600&q=80'
        ],
        category: categoriesMap['Jackets'],
        gender: 'Unisex',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Brown'],
        inventory: 10,
        tags: ['jacket', 'leather', 'winter', 'biker', 'premium'],
        ratings: 4.7,
        numReviews: 18,
        isFeatured: true,
        isNewArrival: true,
        isDealOfTheDay: true
      },
      // Women's Dresses
      {
        title: 'Women Floral Printed A-Line Dress',
        brand: 'Zara',
        description: 'Graceful floral printed A-line midi dress featuring an elasticated square neck collar, puffy sleeves, and a tiered flared hem. Made with lightweight breathable viscose fabric.',
        price: 2799,
        discountPercentage: 15,
        images: [
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80'
        ],
        category: categoriesMap['Dresses'],
        gender: 'Women',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Yellow', 'Pink', 'Light Blue'],
        inventory: 18,
        tags: ['dress', 'floral', 'summer', 'midi', 'party'],
        ratings: 4.3,
        numReviews: 22,
        isFeatured: true,
        isNewArrival: true,
        isDealOfTheDay: false
      },
      // Women's Tops
      {
        title: 'Women Embroidered Anarkali Kurta',
        brand: 'W',
        description: 'Exquisite cotton-blend Anarkali kurta featuring rich metallic embroidery on the yoke, three-quarter sleeves, and a grand flared silhouette. Complete the set with a solid dupatta and churidar leggings.',
        price: 2499,
        discountPercentage: 30,
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=600&q=80'
        ],
        category: categoriesMap['Tops'],
        gender: 'Women',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Red', 'Maroon'],
        inventory: 12,
        tags: ['kurta', 'ethnic', 'traditional', 'cotton', 'embroidered'],
        ratings: 4.4,
        numReviews: 31,
        isFeatured: false,
        isNewArrival: false,
        isDealOfTheDay: true
      },
      // Footwear
      {
        title: 'Court Classic Canvas Sneakers',
        brand: 'Nike',
        description: 'Retro-inspired canvas sneakers featuring padded collar support, flexible rubber cupsole, and vintage brand swoosh print. Complements any streetwear or casual wardrobe.',
        price: 4495,
        discountPercentage: 25,
        images: [
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'
        ],
        category: categoriesMap['Footwear'],
        gender: 'Unisex',
        sizes: ['7', '8', '9', '10'],
        colors: ['White', 'Black', 'Red'],
        inventory: 30,
        tags: ['sneakers', 'shoes', 'canvas', 'nike', 'sportswear'],
        ratings: 4.8,
        numReviews: 67,
        isFeatured: true,
        isNewArrival: true,
        isDealOfTheDay: false
      },
      {
        title: 'Women High-Heeled Party Sandals',
        brand: 'Zara',
        description: 'Elegant strappy block heels featuring gloss finish ankle enclosure, comfortable padded insole, and micro-suede platform. Ideal for formal evenings, corporate parties, and dinners.',
        price: 3299,
        discountPercentage: 20,
        images: [
          'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1596702994230-a88506ea529e?auto=format&fit=crop&w=600&q=80'
        ],
        category: categoriesMap['Footwear'],
        gender: 'Women',
        sizes: ['5', '6', '7', '8'],
        colors: ['Pink', 'Gold', 'Black'],
        inventory: 15,
        tags: ['heels', 'sandals', 'footwear', 'party', 'zara'],
        ratings: 4.1,
        numReviews: 14,
        isFeatured: false,
        isNewArrival: false,
        isDealOfTheDay: false
      },
      // Accessories
      {
        title: 'Chronograph Quartz Analog Watch',
        brand: 'Fossil',
        description: 'Classic Fossil watch featuring a deep black dial, scratch-resistant mineral glass, dates tracker window, and premium brown leather straps. Water-resistant up to 50 meters.',
        price: 9495,
        discountPercentage: 30,
        images: [
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&q=80'
        ],
        category: categoriesMap['Accessories'],
        gender: 'Men',
        sizes: ['Standard'],
        colors: ['Brown', 'Silver'],
        inventory: 8,
        tags: ['watch', 'fossil', 'leather', 'analog', 'premium'],
        ratings: 4.7,
        numReviews: 29,
        isFeatured: true,
        isNewArrival: false,
        isDealOfTheDay: true
      },
      {
        title: 'Unisex Wayfarer UV Sunglasses',
        brand: 'RayBan',
        description: 'Timeless RayBan Wayfarer styling featuring lightweight polarization lenses, custom tortoiseshell frame, and total UV protection coating. Suits oval, round, and square facial geometries.',
        price: 6500,
        discountPercentage: 10,
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'
        ],
        category: categoriesMap['Accessories'],
        gender: 'Unisex',
        sizes: ['Standard'],
        colors: ['Black', 'Brown'],
        inventory: 20,
        tags: ['sunglasses', 'rayban', 'uv-protection', 'eyewear'],
        ratings: 4.9,
        numReviews: 54,
        isFeatured: false,
        isNewArrival: true,
        isDealOfTheDay: false
      },
      // Beauty
      {
        title: 'Oud Intense Luxury Perfume',
        brand: 'Hugo Boss',
        description: 'Exquisite luxury oud spray blended with hints of dark cinnamon, saffron, smoke, and agarwood extract. Long-lasting sillage perfect for formal meetings and dinner dates.',
        price: 7999,
        discountPercentage: 15,
        images: [
          'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80'
        ],
        category: categoriesMap['Beauty'],
        gender: 'Men',
        sizes: ['100ml'],
        colors: ['Oud'],
        inventory: 14,
        tags: ['perfume', 'beauty', 'fragrance', 'luxurious'],
        ratings: 4.6,
        numReviews: 20,
        isFeatured: true,
        isNewArrival: false,
        isDealOfTheDay: false
      },
      {
        title: 'Kids Pack of 3 Cotton Shorts',
        brand: 'U.S. Polo',
        description: 'Lightweight stretchable cotton shorts with comfortable drawstring elasticated waistbands. Soft, non-allergenic, and perfectly dynamic for kids\' summer play activities.',
        price: 1499,
        discountPercentage: 45,
        images: [
          'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80'
        ],
        category: categoriesMap['Bottomwear'],
        gender: 'Kids',
        sizes: ['3-4Y', '5-6Y', '7-8Y'],
        colors: ['Multi-color'],
        inventory: 20,
        tags: ['shorts', 'kids', 'cotton', 'pack', 'summer'],
        ratings: 4.4,
        numReviews: 17,
        isFeatured: false,
        isNewArrival: true,
        isDealOfTheDay: false
      }
    ];

    for (const prod of productsData) {
      await Product.create(prod);
    }

    console.log('Products seeded successfully.');
    mongoose.connection.close();
    console.log('DB Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding: ', error.message);
    process.exit(1);
  }
};

seedData();
