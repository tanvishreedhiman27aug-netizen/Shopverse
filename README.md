# Myntra-Inspired Full-Stack E-Commerce Platform

A pixel-perfect, highly responsive e-commerce web application inspired by Myntra. It features a modern design system, glassmorphism layouts, robust REST APIs, Redux state management, a rule-based AI Outfit Recommendation engine, Web Speech API Voice Search, and interactive checkout tracking.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React.js (Vite compiler)
- **Styling**: Tailwind CSS + custom Google Fonts (Assistant & Inter)
- **Animations**: Framer Motion (page transitions, dialog scale-ups, sliding drawers)
- **State Management**: Redux Toolkit (global states for auth, products, bag, wishlist, and orders)
- **Analytics Charts**: Recharts (for admin dashboard sales and categories breakdowns)

### Backend & Database
- **Server**: Node.js + Express.js
- **Database**: MongoDB (Mongoose schemas with indexes for text searching and compound reviews)
- **Authentication**: JSON Web Tokens (JWT) + Google OAuth mock payloads
- **Payments**: Stripe payment intents processing flow

---

## 🛠️ Folder Structure

```
my-myntra-store/
├── backend/
│   ├── config/             # DB connectivity
│   ├── controllers/        # Express route business logic (Auth, Product, Cart, Order, Admin)
│   ├── middleware/         # Route protectors, admin checkers, error boundaries
│   ├── models/             # Mongoose schemas (User, Product, Order, Category, Review)
│   ├── routes/             # API routes definitions
│   ├── utils/              # JWT generator helpers
│   ├── scripts/            # Database seed script
│   ├── .env                # Local environment configurations
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── assets/         # Styles, fonts, media
    │   ├── components/     # Reusable UI (Navbar, Footer, ProductCard, SkeletonCard, HeroCarousel)
    │   ├── hooks/          # Custom hooks (useVoiceSearch, useInfiniteScroll)
    │   ├── pages/          # Home, Catalog, ProductDetails, Wishlist, Cart, Checkout, Profile, AdminDashboard, OrderSuccess
    │   ├── redux/          # Redux Toolkit store and slices (auth, products, cart, wishlist, orders)
    │   ├── App.jsx         # Routing configuration
    │   ├── index.css       # Core Tailwind directives + scrollbars
    │   └── main.jsx        # Mount point
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── index.html
```

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: Version 18 or above.
- **MongoDB**: A running MongoDB instance. You can either:
  1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) locally.
  2. Create a free shared cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### Step 1: Database & Environment Configuration
1. Open the `backend/.env` file.
2. Update the `MONGODB_URI` environment variable with your connection string:
   - Local: `MONGODB_URI=mongodb://localhost:27017/myntra_clone`
   - Cloud Atlas: `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/myntra_clone`
3. If using real Stripe or Google login credentials, add your actual keys, otherwise the system will automatically fall back to sandbox test simulations.

### Step 2: Seed the Database
Seed the database with default fashion categories, 20+ realistic products (with multiple images, sizing, color variants, and search tags), and default test users:
```bash
cd backend
npm run seed
```
*(This creates two default users: `user@myntra.com` and `admin@myntra.com` with password `password123`)*

### Step 3: Run Backend API
```bash
cd backend
npm run dev
```
The Express server boots on `http://localhost:5000`.

### Step 4: Run Frontend Client
```bash
cd ../frontend
npm install
npm run dev
```
The Vite development server boots on `http://localhost:5173`. Open this URL in your web browser.

---

## 💡 Sandbox Highlights & How to Test

### 1. Test Login Accounts
Sign in using the mock credentials to unlock user panels and the dashboard:
- **Regular Customer**: `user@myntra.com` / `password123`
- **Administrator**: `admin@myntra.com` / `password123`
- **Google Sign-In**: Click "Continue with Google" on the login screen to authenticate a sandbox Google Profile.

### 2. AI Recommendation & Outfit Suggester
- When viewing any product details page (e.g. a shirt), the backend **AI Outfit Suggester** uses tag overlap and category affinities to suggest complementary pieces (e.g. matching trousers, sneakers, and sunglasses) in the "AI Outfit Suggestions" section.
- If logged in, the homepage "Your Style Picks" panel automatically customizes recommendations based on your profile's preferred gender. You can edit this preference in `Profile Details -> AI Recommendation Settings`.

### 3. Voice Search
- Click the Microphone icon inside the Search bar on desktop or mobile.
- Speak search queries (e.g., "shirt", "nike sneakers", "leather jacket").
- The custom hook `useVoiceSearch` translates speech to text and automatically queries the catalog.

### 4. Promo Coupons
Inside the Shopping Bag (Cart) summary panel, type one of these promo codes to recalculate bill totals:
- `MYNTRA200`: Subtracts a flat ₹200 off your final bill.
- `FASHION20`: Deducts an extra 20% discount on your bag subtotal.

### 5. Stripe Online Payment Simulation
- Place items in the bag and select **Credit/Debit Card** on the Checkout page.
- Input card details (e.g., card number, expiry, CVV, holder name).
- Press "Pay & Confirm". An overlay animates the Stripe transaction lock, deducts product inventory quantities, generates an order confirmation invoice, and updates transaction ledger records on the backend.

### 6. Order Tracking Timeline & Returns
- Expand any past order in your `Profile -> Order History` to view its real-time **package tracking history timeline**.
- Go to the **Admin Dashboard** (`/admin`) and change the status dropdown of the order (e.g., set to *Shipped* or *Delivered*).
- Reload the customer profile page to see the tracking timeline update with checkpoints (e.g., *Your package has been shipped and is on its way*).
- Once status is set to *Delivered*, a "Request Return" button appears on the customer order card. Clicking it submits a return case and logs the request on the timeline.
