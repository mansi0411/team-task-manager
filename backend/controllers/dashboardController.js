/**
 * Dashboard controller
 * Returns task statistics for admins (all tasks) or members (assigned tasks only)
 */

const Task = require("../models/Task");

/**
 * Build MongoDB filter based on user role
 * Admin  → all tasks
 * Member → only tasks assigned to the logged-in user
 */
const getTaskFilterForUser = (user) => {
  if (user.role === "admin") {
    return {};
  }

  return { assignedTo: user._id };
};

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard task statistics
 * @access  Private (any logged-in user)
 */
const getDashboardStats = async (req, res) => {
  try {
    const filter = getTaskFilterForUser(req.user);
    const now = new Date();

    // Run all counts in parallel for better performance
    const [totalTasks, completedTasks, pendingTasks, overdueTasks] =
      await Promise.all([
        // Total number of tasks in scope
        Task.countDocuments(filter),

        // Tasks marked as Completed
        Task.countDocuments({
          ...filter,
          status: "Completed",
        }),

        // Tasks not yet completed (Todo or In Progress)
        Task.countDocuments({
          ...filter,
          status: { $ne: "Completed" },
        }),

        // Overdue: not completed AND due date is before now
        Task.countDocuments({
          ...filter,
          status: { $ne: "Completed" },
          dueDate: { $lt: now },
        }),
      ]);

    res.status(200).json({
      success: true,
      dashboard: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard statistics",
    });
  }
};

module.exports = {
  getDashboardStats,
};
