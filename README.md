# BusyCart - Full-Stack E-Commerce Platform

BusyCart is a comprehensive e-commerce platform backend, designed to handle everything from user authentication to order processing, payments, reviews, and analytics. It is built with a robust, modern technology stack focused on scalability and type safety.

*Note: Currently, the repository contains the backend component of the application. The frontend is planned/in progress.*

## 🚀 Tech Stack

- **Runtime environments:** Node.js
- **Framework:** Express.js 
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database Engine:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens), Passport.js (Google OAuth2.0)
- **File Uploads:** Multer, Cloudinary
- **PDF Generation:** PDFKit (used for generating invoices)

## ✨ Core Features

### 🔐 Authentication & Authorization
- Email and password registration/login with **bcrypt** password hashing.
- Google OAuth integration for instant login/registration.
- JWT-based authentication with access and refresh tokens.
- Role-based access control (RBAC): `SUPER_ADMIN`, `ADMIN`, and `USER`.

### 🛒 Product & Category Management
- Categorization with hierarchical support (parent/child categories).
- Product management including stock tracking, discounts, pricing, and multiple images.
- Soft deletion for products to maintain historical order data.
- Search, filter, and pagination capabilities.

### 🛍️ User Cart & Wishlist
- Persistent shopping cart tracking items and quantities.
- Wishlist functionality to save favorite products.

### 📦 Order Management
- Complete order lifecycle mapping (Pending -> Paid -> Shipped -> Delivered, etc.).
- Tax, shipping, and discount computations.
- Analytics and tracking capabilities for admins.

### 💳 Payments & Refunds
- Payment tracking integration (Created, Processing, Succeeded, Failed, Refunded).
- Integrated refund processing and lifecycle tracking.
- Coupon and discount code system (Percentage/Fixed amounts, Expiration dates, Min required amounts).

### ⭐ Reviews & Ratings
- Users can leave ratings and text reviews for products they've purchased.
- Integrated average rating and total review counts per product.

### 📝 Invoices & Reporting
- Automated generated PDF invoices utilizing `PDFKit` for user orders.
- Analytics endpoints for metrics (e.g., sales, top products, user activities).
- Activity logging system mapping user actions for audit trails.

## 📂 Project Structure

```
├── backend/
│   ├── prisma/             # Prisma ORM schema & migrations configuration
│   ├── src/
│   │   ├── config/         # App configurations (Cloudinary, Passport, etc.)
│   │   ├── controller/     # Business logic handlers
│   │   ├── generated/      # Prisma generated client
│   │   ├── middleware/     # Custom Express middleware (Auth, Error handling)
│   │   ├── routes/         # Express routing definitions
│   │   ├── types/          # Global TypeScript interfaces and types
│   │   ├── utils/          # Helper functions (Token generation, etc.)
│   │   ├── app.ts          # Express Application setup
│   │   └── server.ts       # Main Entry point
│   ├── .env                # Environment variables (excluded from VCS)
│   ├── package.json        # Node.js dependencies and scripts
│   └── tsconfig.json       # TypeScript configuration
```

## 🛠️ Getting Started (Backend)

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database
- Cloudinary API Keys (for media uploads)
- Google OAuth Credentials (for SSO login)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd BusyCart
   ```

2. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Environment Configuration:**
   Create a `.env` file in the `backend/` directory referencing your database and API keys:
   ```env
   DATABASE_URL="postgresql://<YOUR_DB_USER>:<YOUR_DB_PASSWORD>@<YOUR_DB_HOST>:<YOUR_DB_PORT>/<YOUR_DB_NAME>?schema=public"
   PORT=...
   JWT_SECRET=...
   # (Add Cloudinary keys, Google OAuth keys, etc.)
   ```

5. **Prisma Setup:**
   Generate the Prisma client and push the schema to the database.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a pull request if you'd like to improve the BusyCart project.
