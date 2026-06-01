/**
 * Authentication middleware
 * Verifies JWT tokens and attaches the logged-in user to req.user
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect routes — only allow access with a valid Bearer token
 *
 * Client must send header:
 *   Authorization: Bearer <your_jwt_token>
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with "Bearer"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      // split(" ") => ["Bearer", "<token>"] — we take index [1]
      token = req.headers.authorization.split(" ")[1];
    }

    // No token in header
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    // Verify token signature and expiration using secret from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded contains payload from login: { userId, role, iat, exp }
    const user = await User.findById(decoded.userId);

    // Token valid but user was deleted from database
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    // Make user available in route handlers as req.user
    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws for expired, tampered, or malformed tokens
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token",
    });
  }
};

module.exports = { protect };
