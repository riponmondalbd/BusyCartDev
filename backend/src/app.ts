import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { appEnv } from "./config/env";
import passport from "./config/passport";
import { errorHandler } from "./middleware/error.middleware";
import router from "./routes";
import { AppError } from "./utils/AppError";

// install express app
const app = express();

// middleware
if (appEnv.isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: appEnv.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(passport.initialize());
app.use(cookieParser());

// health check route
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// add routes
app.use("/api", router);

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error handler
app.use(errorHandler);

export default app;
