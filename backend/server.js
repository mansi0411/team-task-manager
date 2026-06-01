const path = require("path");

// Load .env from the backend folder
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Create Express application instance
const app = express();

// ----- Middleware -----

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://team-task-manager-liard-alpha.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

// Parse incoming JSON request bodies
app.use(express.json());

// ----- Routes -----

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Team Task Manager API is running",
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Protected test routes
app.use("/api/test", testRoutes);

// Project management routes
app.use("/api/projects", projectRoutes);

// Task management routes
app.use("/api/tasks", taskRoutes);

// Dashboard analytics
app.use("/api/dashboard", dashboardRoutes);

// ----- Error handling -----

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ----- Start server -----

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
