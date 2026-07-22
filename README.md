# BusyCart

BusyCart is a full-stack e-commerce platform with a Next.js storefront and an Express + Prisma API. It covers catalog browsing, cart and wishlist flows, checkout, payments, refunds, reviews, admin operations, analytics, and invoice generation.

## Overview

The repository is split into two apps:

- `frontend/` contains the Next.js storefront and dashboard UI.
- `backend/` contains the Express API, Prisma schema, business logic, and database migrations.

The project is designed to run locally with PostgreSQL and can be deployed as two separate services:

- Frontend: Vercel or any Next.js host.
- Backend: any Node.js host with PostgreSQL access.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript
- Backend: Express 5, TypeScript, Node.js
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT, refresh tokens, Passport Google OAuth
- Media: Cloudinary, Multer
- Security: Helmet, CORS, rate limiting, cookie parsing, compression
- Invoicing: PDFKit

## Features

### Storefront

- Product browsing with search, filters, pagination, and category navigation.
- Product detail pages with ratings, reviews, images, and stock-aware behavior.
- Cart, wishlist, checkout, order tracking, and support pages.
- Marketing sections such as banners and deal-of-the-day highlights.

### Authentication and Accounts

- Email/password registration and login.
- Google OAuth login.
- Access and refresh token flow.
- Role-based access control for `USER`, `ADMIN`, and `SUPER_ADMIN`.
- User profile image support.

### Commerce Operations

- Products with pricing, discounts, stock, soft deletion, and multiple images.
- Categories with parent-child relationships.
- Coupons with discount rules and expiry support.
- Cart persistence and wishlist persistence.
- Orders with taxes, shipping, discounts, and lifecycle tracking.
- Payments and refunds with status tracking.
- Reviews with rating aggregation.

### Admin and Reporting

- Admin-facing management endpoints for products, categories, banners, coupons, deals, orders, refunds, and users.
- Analytics endpoints for platform metrics.
- Invoice generation for orders.
- Activity logging for operational traceability.

## Repository Structure

```text
BusyCartDev/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       ├── controller/
│       ├── middleware/
│       ├── routes/
│       ├── scripts/
│       ├── types/
│       └── utils/
└── frontend/
    └── src/
        ├── app/
        ├── components/
        ├── config/
        ├── store/
        └── utils/
```

## Backend Architecture

The API is organized around route modules and controllers. Available route groups include:

- Authentication and Google OAuth
- Users and admin user management
- Products and categories
- Cart and wishlist
- Orders, payments, and refunds
- Coupons and deal-of-the-day
- Reviews and analytics
- Banners and invoices
- Refresh token handling

The API is mounted under `/api` and includes security middleware for:

- CORS allow-listing
- HTTP header hardening
- rate limiting
- JSON body size limits
- centralized error handling

## Data Model

The Prisma schema currently includes these core entities:

- `User`
- `RefreshToken`
- `Category`
- `Product`
- `DealOfDay`
- `Wishlist`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Payment`
- `Coupon`
- `Refund`
- `Review`
- `ActivityLog`
- `Banner`

## Frontend Routes

The storefront includes routes for:

- Home
- Login and registration
- Products and product details
- Categories
- Cart
- Checkout
- Wishlist
- Dashboard
- Track order
- Help, privacy, and terms pages

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL database
- Optional: Google OAuth credentials
- Optional: Cloudinary account

## Environment Configuration

Do not commit real credentials or database URLs. Use the example file in `backend/.env.example` as the source of truth for backend variables.

### Backend

Required in all environments:

- `DATABASE_URL`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `FRONTEND_URL`

Optional business configuration:

- `PORT`
- `TAX_RATE`
- `SHIPPING_FEE`
- `FREE_SHIPPING_THRESHOLD`

Optional OAuth and media settings:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Frontend

Create `frontend/.env.local` with:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`

If `NEXT_PUBLIC_API_URL` is omitted in development, the app falls back to `http://localhost:5000/api`.

## Local Development

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example`, then run Prisma and seed scripts as needed:

```bash
npx prisma generate
npx prisma db push
npm run seed:all
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Production Build Check

```bash
cd backend
npm run build

cd ../frontend
npm run build
```

## Scripts

### Backend

- `npm run dev` - start the API in development mode
- `npm run build` - compile TypeScript
- `npm run start` - run the compiled server
- `npm run seed:roles` - seed role data
- `npm run seed:catalog` - seed catalog data
- `npm run seed:products` - seed additional products
- `npm run seed:all` - run all seed scripts in sequence

### Frontend

- `npm run dev` - start the Next.js dev server
- `npm run build` - production build
- `npm run start` - run the built frontend
- `npm run lint` - run ESLint

## Deployment

### Frontend

- Deploy the `frontend/` directory as a standalone Next.js app.
- Set `NEXT_PUBLIC_API_URL` to the deployed backend API base URL.
- Set `NEXT_PUBLIC_SITE_URL` to the public frontend origin.

### Backend

- Deploy the `backend/` directory to a Node.js host.
- Provision PostgreSQL and point `DATABASE_URL` at it.
- Configure CORS by setting `FRONTEND_URL` to the public frontend origin.
- Add the OAuth and Cloudinary variables only if those features are enabled.

## Security Notes

- Keep `.env`, `.env.local`, API secrets, OAuth credentials, database URLs, and Cloudinary credentials out of version control.
- Use strong random values for token secrets.
- Review the allowed frontend origins before production deployment.
- Rotate credentials immediately if any secret is ever exposed.

## Troubleshooting

- If the backend exits on startup, verify that all required environment variables are present.
- If the frontend cannot reach the API, confirm `NEXT_PUBLIC_API_URL` and backend CORS settings.
- If Prisma commands fail, verify `DATABASE_URL` and that PostgreSQL is reachable.
- If Google login fails, check the OAuth client, callback URL, and frontend redirect configuration.

## Contributing

Issues and pull requests are welcome. Keep changes focused, avoid committing secrets, and update the documentation when behavior changes.

---

Developed by [Ripon](https://riponmondalbd.vercel.app)
