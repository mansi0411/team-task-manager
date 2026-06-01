/**
 * Test routes for JWT protection and role-based access
 * Base path in server.js: /api/test
 *
 * Use these to verify auth middleware before building task routes
 */

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

/**
 * @route   GET /api/test/profile
 * @desc    Any logged-in user can access (admin or member)
 * @access  Private
 */
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * @route   GET /api/test/admin
 * @desc    Only users with role "admin" can access
 * @access  Private / Admin
 */
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin",
  });
});

module.exports = router;
