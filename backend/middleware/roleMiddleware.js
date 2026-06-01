/**
 * Role-based access control middleware
 * Restricts routes to users with specific roles
 *
 * Must run AFTER protect middleware so req.user exists
 */

/**
 * Factory function — returns middleware that checks user role
 *
 * @param  {...string} roles - Allowed roles, e.g. authorizeRoles("admin")
 *
 * Usage in routes:
 *   router.get("/admin", protect, authorizeRoles("admin"), handler);
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // protect should have set req.user; this is a safety check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, please log in",
      });
    }

    // Check if user's role is in the allowed list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not allowed to access this resource`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
