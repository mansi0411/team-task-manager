/**
 * Dashboard routes
 * Base path in server.js: /api/dashboard
 */

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getDashboardStats } = require("../controllers/dashboardController");

const router = express.Router();

/**
 * @route   GET /api/dashboard
 * @desc    Task statistics for admin (all) or member (assigned only)
 * @access  Private — any logged-in user with valid JWT
 */
router.get("/", protect, getDashboardStats);

module.exports = router;
