/**
 * Task routes
 * Base path in server.js: /api/tasks
 */

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require("../controllers/taskController");

const router = express.Router();

// ----- Admin-only routes -----

// POST /api/tasks — create and assign task
router.post("/", protect, authorizeRoles("admin"), createTask);

// PUT /api/tasks/:id — update task (including reassignment)
router.put("/:id", protect, authorizeRoles("admin"), updateTask);

// DELETE /api/tasks/:id — delete task
router.delete("/:id", protect, authorizeRoles("admin"), deleteTask);

// ----- Admin or assigned member -----

// PATCH /api/tasks/:id/status — update status only
// Defined before GET /:id is optional; different HTTP methods avoid conflicts
router.patch("/:id/status", protect, updateTaskStatus);

// ----- Any logged-in user (controller applies member filters) -----

// GET /api/tasks — list tasks (all for admin, own for member)
router.get("/", protect, getTasks);

// GET /api/tasks/:id — single task
router.get("/:id", protect, getTaskById);

module.exports = router;
