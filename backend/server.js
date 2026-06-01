/**
 * Team Task Manager - Main server entry point
 * Sets up Express, middleware, routes, and database connection
 */

const path = require("path");

// Load .env from the backend folder (not whatever folder you run the command from)
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

// CORS: allows your frontend (different port/domain) to call this API
app.use(cors());

// Parse incoming JSON request bodies (req.body)
app.use(express.json());

// ----- Routes -----

/**
 * Health check route - visit http://localhost:5000/ in browser or Postman
 */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Team Task Manager API is running",
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes: /api/auth/register, /api/auth/login
app.use("/api/auth", authRoutes);

// Protected test routes: /api/test/profile, /api/test/admin
app.use("/api/test", testRoutes);

// Project management routes
app.use("/api/projects", projectRoutes);

// Task management routes
app.use("/api/tasks", taskRoutes);

// Dashboard analytics
app.use("/api/dashboard", dashboardRoutes);

// ----- Error handling -----

/**
 * 404 handler - runs when no route matches the request URL
 * Must be AFTER all route definitions
 */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/**
 * Global error handler - catches errors passed via next(error)
 */
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

/**
 * Start the server only after MongoDB is connected
 */
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
