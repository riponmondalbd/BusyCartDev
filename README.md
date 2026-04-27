# BusyCart - Full-Stack E-Commerce Platform

BusyCart is a full-stack e-commerce platform with a Next.js frontend and an Express + Prisma backend, designed for secure auth, catalog management, orders, payments, reviews, and analytics.

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

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- Cloudinary API keys (optional for media uploads)
- Google OAuth credentials (optional for SSO login)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example`, then run:

```bash
npx prisma generate
npx prisma db push
npm run seed:catalog
npm run seed:products
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local` from `frontend/.env.example`, then run:

```bash
npm run dev
```

### 3. Production Build Validation

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

## 🚀 Deployment (Vercel + API)

### Frontend (Vercel)

- Deploy the `frontend/` directory as a Vercel project.
- Set environment variables in Vercel:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_SITE_URL`

### Backend (API Host)

- Deploy `backend/` to a Node.js host (Render, Railway, Fly.io, VPS, etc.).
- Set server-side environment variables from `backend/.env.example`.
- Point frontend `NEXT_PUBLIC_API_URL` to the deployed backend API URL.

For full cleanup and readiness changes applied, see `DEPLOYMENT_REPORT.md`.

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a pull request if you'd like to improve the BusyCart project.
