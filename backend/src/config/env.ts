import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

const requiredInAllEnvs = [
  "DATABASE_URL",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "FRONTEND_URL",
] as const;

for (const key of requiredInAllEnvs) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const appEnv = {
  isProduction,
  port: Number(process.env.PORT || 5000),
  corsOrigins: String(process.env.FRONTEND_URL)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  taxRate: Number(process.env.TAX_RATE || 0.1),
  shippingFee: Number(process.env.SHIPPING_FEE || 20),
  freeShippingThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD || 500),
};
