# BusyCart Frontend

The frontend for **BusyCart**, a full-featured e-commerce marketplace built with [Next.js 16](https://nextjs.org), [React 19](https://react.dev), and [TypeScript](https://www.typescriptlang.org).

## Features

### Public Pages
- **Landing Page** — Hero carousel, product dashboard, category navigation, deal-of-the-day countdown, and dynamic banners
- **Product Browsing** — Product listing with filtering, product detail pages, and category views
- **Authentication** — Login and registration with Google OAuth support
- **Shopping Cart** — Add, remove, and manage cart items
- **Checkout** — Streamlined checkout flow
- **Wishlist** — Save and manage favorite products
- **Order Tracking** — Real-time order status tracking
- **Help, Privacy & Terms** — Informational pages

### User Dashboard
- **Dashboard Overview** — Personalized user dashboard
- **My Orders** — View and manage orders
- **My Refunds** — Submit and track refund requests
- **Wishlist Management** — Access saved items from the dashboard

### Admin Dashboard
- **User Management** — View and manage platform users
- **Order Management** — Monitor and process orders
- **Refund Management** — Review and handle refund requests
- **Banner Management** — Manage homepage promotional banners
- **Deal of the Day** — Configure daily deals

### Super Admin Dashboard
- **Admin Management** — Create and manage admin accounts
- **Coupon Management** — Create and manage discount coupons
- **Inventory Management** — Oversee product inventory

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| UI Library | [React 19](https://react.dev) |
| Icons | [Lucide React](https://lucide.dev) |
| Toast Notifications | [React Hot Toast](https://react-hot-toast.com) |
| Confirm Dialogs | [SweetAlert2](https://sweetalert2.github.io) |
| Images | Unsplash & Cloudinary via Next.js Image Optimization |

## Configuration

### Image Optimization

The [`next.config.ts`](next.config.ts) allows optimized image loading from:

- `images.unsplash.com`
- `res.cloudinary.com`
- `localhost` (HTTP, for local development)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── login/page.tsx      # Login
│   ├── register/page.tsx   # Registration
│   ├── products/           # Product listing & detail pages
│   ├── categories/page.tsx # Category browsing
│   ├── cart/page.tsx       # Shopping cart
│   ├── checkout/page.tsx   # Checkout
│   ├── wishlist/page.tsx   # Public wishlist
│   ├── track-order/page.tsx# Order tracking
│   ├── dashboard/          # User & admin dashboards
│   │   ├── layout.tsx      # Dashboard shell layout
│   │   ├── page.tsx        # Dashboard home
│   │   ├── orders/         # User orders
│   │   ├── refunds/        # User refunds
│   │   ├── wishlist/       # Dashboard wishlist
│   │   ├── profile/        # User profile
│   │   ├── admin/          # Admin panels
│   │   └── super-admin/    # Super admin panels
│   ├── help/page.tsx       # Help center
│   ├── privacy/page.tsx    # Privacy policy
│   └── terms/page.tsx      # Terms of service
├── components/             # Reusable UI components
│   ├── Navbar.tsx          # Navigation bar
│   ├── Footer.tsx          # Site footer
│   ├── Skeleton.tsx        # Loading skeletons
│   ├── ErrorBoundary.tsx   # React error boundary
│   └── ToastProvider.tsx   # Toast notification provider
├── store/                  # Global state management
│   ├── AuthContext.tsx     # Authentication context
│   └── WishlistContext.tsx # Wishlist context
├── utils/                  # Utility functions
│   ├── api.ts              # API client / request helpers
│   ├── auth.ts             # Authentication utilities
│   ├── validation.ts       # Form validation helpers
│   └── withAuth.tsx        # Auth-required wrapper HOC
└── config/
    └── env.ts              # Environment variable configuration
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ recommended
- A running [BusyCart Backend API](../backend/README.md)

### Installation

```bash
npm install
```

### Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `NEXT_PUBLIC_GOOGLE_CALLBACK_URL` | Google OAuth callback URL |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for metadata and canonical links |

> **Note:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## API Integration

The frontend communicates with the BusyCart backend through the configured `NEXT_PUBLIC_API_URL`. The API client is centralized in [`src/utils/api.ts`](src/utils/api.ts) and handles:

- Base URL configuration
- Request/response interceptors
- Authentication token injection
- Error handling

## Authentication

Authentication is managed via React Context (`AuthContext`) and protected routes are enforced using the `withAuth` wrapper. Supported methods include:

- Email/password login & registration
- Google OAuth (configured via environment variables)

## Role-Based Access

The dashboard implements role-based access control:

| Role | Access |
|---|---|
| **User** | My Orders, My Refunds, Wishlist, Profile |
| **Admin** | All user features + User Management, Order Management, Refund Management, Banner Management, Deal of the Day |
| **Super Admin** | All admin features + Admin Management, Coupon Management, Inventory Management |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Deployment

The easiest way to deploy is on [Vercel](https://vercel.com/new?utm_source=create-next-app):

1. Push your code to a Git repository
2. Import the project in Vercel
3. Configure environment variables in Vercel settings
4. Deploy

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is part of the BusyCart marketplace.
