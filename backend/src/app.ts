import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import passport from "./config/passport";
import router from "./routes";

// load environment variables
dotenv.config();

// install express app
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser());

// health check route
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// add routes
app.use("/api", router);

export default app;
