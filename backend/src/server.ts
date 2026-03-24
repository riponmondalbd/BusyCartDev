import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes";

// load environment variables
dotenv.config();

// install express app
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// health check route
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// add routes
app.use("/api/auth", authRoutes);

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
