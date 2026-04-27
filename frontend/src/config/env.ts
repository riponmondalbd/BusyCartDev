// Frontend environment configuration
// Note: Variables must be prefixed with NEXT_PUBLIC_ to be accessible in the browser

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const GOOGLE_CALLBACK_URL =
  process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL ||
  "https://busy-cart-dev-backend.vercel.app/api/auth/google/callback";
const NODE_ENV = process.env.NODE_ENV || "development";

// Warn in development if using default values
if (NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
  if (typeof window === "undefined") {
    console.warn(
      "⚠️  NEXT_PUBLIC_API_URL not configured, using default: http://localhost:5000/api",
    );
    console.warn(
      "💡 Create a .env.local file with NEXT_PUBLIC_API_URL to override",
    );
  }
}

export const env = {
  API_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CALLBACK_URL,
  isDevelopment: NODE_ENV === "development",
  isProduction: NODE_ENV === "production",
} as const;
