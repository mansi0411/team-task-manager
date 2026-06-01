/**
 * Project routes
 * Base path in server.js: /api/projects
 */

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMemberToProject,
} = require("../controllers/projectController");

const router = express.Router();

// ----- Admin-only routes -----

// POST /api/projects — create project
router.post("/", protect, authorizeRoles("admin"), createProject);

// PUT /api/projects/:id — update project
router.put("/:id", protect, authorizeRoles("admin"), updateProject);

// DELETE /api/projects/:id — delete project
router.delete("/:id", protect, authorizeRoles("admin"), deleteProject);

// POST /api/projects/:id/members — add member (defined before GET /:id is fine; unique path)
router.post(
  "/:id/members",
  protect,
  authorizeRoles("admin"),
  addMemberToProject
);

// ----- Any logged-in user -----

// GET /api/projects — list all projects
router.get("/", protect, getProjects);

// GET /api/projects/:id — single project
router.get("/:id", protect, getProjectById);

module.exports = router;
