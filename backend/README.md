# BusyCart Backend API

Express.js + TypeScript backend powering the **BusyCart** e-commerce marketplace. Built with Prisma ORM, PostgreSQL, JWT authentication, and Google OAuth 2.0.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Express.js](https://expressjs.com/) v5 |
| Language | TypeScript |
| Database | PostgreSQL (hosted on Neon) |
| ORM | Prisma v7 |
| Authentication | JWT + Passport.js (Google OAuth 2.0) |
| File Storage | Cloudinary |
| PDF Generation | pdfkit |
| Security | helmet, CORS, express-rate-limit |
| Image Upload | Multer |

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database models & relations
│   └── migrations/            # Prisma migration history
├── src/
│   ├── config/                # Environment, Passport, Cloudinary configs
│   ├── controller/            # Business logic controllers (21)
│   ├── middleware/            # Auth, validation, error handling, upload
│   ├── prisma/                # Prisma client singleton
│   ├── routes/                # Route definitions (18 files)
│   ├── scripts/               # Database seeding scripts
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Helper utilities
│   ├── validations/           # Request validation schemas
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── dist/                      # Compiled JavaScript output
└── node_modules/
```

## API Endpoints

All routes are prefixed with `/api`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout and revoke refresh token |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| POST | `/api/refresh` | Refresh access token |

### User & Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/user` | Get/update profile |
| GET | `/api/super/admin` | Super admin operations |
| GET/PUT | `/api/admin` | Admin panel endpoints |

### Products & Catalog

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/product` | Product management |
| GET | `/api/category` | Category listing & hierarchy |
| CRUD | `/api/deal-of-day` | Daily deals |
| GET | `/api/banner` | Banner management |

### Shopping

| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/cart` | Shopping cart |
| GET | `/api/wishlist` | User wishlists |
| POST | `/api/order` | Place an order |
| GET/PUT | `/api/order` | Order management & status |
| POST | `/api/payment` | Payment processing |
| POST | `/api/coupon` | Coupon application |
| POST | `/api/refund` | Refund requests |

### Content & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/review` | Product reviews |
| GET | `/api/analytics` | Dashboard analytics |
| GET | `/api/invoice` | Invoice PDF generation |

## Authentication & Authorization

The API uses a multi-strategy auth system:

- **JWT Access Tokens** — short-lived, sent via `Authorization` header or cookie
- **Refresh Tokens** — longer-lived, stored in HTTP-only cookies and validated against the database
- **Google OAuth 2.0** — Passport.js strategy for social login

### Roles

| Role | Access |
|---|---|
| `SUPER_ADMIN` | Full platform access |
| `ADMIN` | Merchant/admin panel operations |
| `USER` | Customer-facing actions |

Protected routes use the `protect` middleware; role-based access uses `authorize(...roles)`.

## Security

- **helmet** — secure HTTP response headers
- **CORS** — restricted to configured frontend origins
- **Rate limiting** — 500 requests per 15 minutes
- **Cookie-based tokens** — httpOnly, secure flags
- **bcrypt** — password hashing
- **Prisma parameterized queries** — SQL injection protection

## Database

PostgreSQL managed by Prisma ORM. Key models:

```
User ── RefreshToken
Category (hierarchical, self-referencing parent/child)
Product (with images, ratings, soft delete)
DealOfDay · Wishlist · Cart · CartItem
Order · OrderItem · Payment · Coupon · Refund
Review · ActivityLog · Banner
```

### Migrations

```bash
npx prisma migrate dev --name <description>
npx prisma migrate deploy        # Production
npx prisma generate              # Regenerate client
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- PostgreSQL database (or Neon free tier account)
- Cloudinary account (for image uploads)
- Google Cloud Console project (for OAuth)

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://...

# JWT
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL (CORS)
FRONTEND_URL=https://busy-cart-dev.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional defaults
TAX_RATE=0.1
SHIPPING_FEE=20
FREE_SHIPPING_THRESHOLD=50
```

### Database Setup

```bash
# Create tables from schema
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed the database
npm run seed:all
```

### Running the Server

```bash
# Development (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The server starts on `http://localhost:5000`.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with ts-node-dev (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |
| `npm run seed:roles` | Seed user roles |
| `npm run seed:catalog` | Seed categories & products |
| `npm run seed:products` | Seed product data |
| `npm run seed:all` | Run all seeders |

## Architecture Notes

- **Controller-driven** — business logic lives in controllers; routes define endpoint structure.
- **Centralized error handling** — custom `AppError` class + error middleware.
- **Request validation** — schemas in `src/validations/` validate incoming payloads.
- **Soft deletes** — products use `isDeleted` flag instead of hard deletion.
- **Order state machine** — `orderStateMachine.ts` manages the order lifecycle.
- **Hierarchical categories** — self-referencing `parent` relation supports nested categories.

## API Response Format

Standard responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

Errors return:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400
  }
}
```

## License

Private — all rights reserved.
