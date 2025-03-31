const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// CORS configuration for development
const corsOptions = {
  origin: [
    "http://localhost:5173",    // Vite frontend
    "http://127.0.0.1:5173",   // Vite frontend alternative
    "http://localhost:5000",    // Backend
    "http://127.0.0.1:5000",   // Backend alternative
    "http://localhost:3000",    // Alternative backend port
    "http://127.0.0.1:3000"    // Alternative backend port
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// This handles all OPTIONS requests (pre-flight requests)
app.options("*", cors(corsOptions));

app.use(express.json());

// MongoDB connection
const uri = process.env.MONGO_URI;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 40000,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "hello" });
});

// Import routes
const authRoutes = require("./routes/Authentication");
const jobRoutes = require("./routes/job");
const categoryRoutes = require("./routes/category");
const applicationRoutes = require("./routes/application");
const profileRoutes = require("./routes/profile");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
