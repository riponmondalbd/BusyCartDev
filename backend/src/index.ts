import cors from "cors";
import dotenv from "dotenv";
import express from "express";

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

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
