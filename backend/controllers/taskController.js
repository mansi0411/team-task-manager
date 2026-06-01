/**
 * Task controller
 * Handles task CRUD, assignment, and status updates with role-based rules
 */

const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

const VALID_STATUSES = Task.TASK_STATUSES;

/**
 * Populate project and user fields on task queries
 */
const populateTaskFields = (query) => {
  return query
    .populate("project", "name description")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");
};

/**
 * Check if the logged-in user is an admin
 */
const isAdmin = (user) => user.role === "admin";

/**
 * Check if the logged-in user is assigned to the task
 */
const isAssignee = (user, task) =>
  task.assignedTo._id
    ? task.assignedTo._id.toString() === user._id.toString()
    : task.assignedTo.toString() === user._id.toString();

/**
 * Validate status string against allowed enum values
 */
const isValidStatus = (status) => VALID_STATUSES.includes(status);

/**
 * Validate and parse due date
 */
const parseDueDate = (dueDate) => {
  if (!dueDate) {
    return { error: "Due date is required" };
  }

  const parsed = new Date(dueDate);

  if (Number.isNaN(parsed.getTime())) {
    return { error: "Invalid due date format" };
  }

  return { date: parsed };
};

/**
 * Verify project and assigned user exist in the database
 */
const validateProjectAndAssignee = async (projectId, assignedToId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return { error: "Invalid project ID", statusCode: 400 };
  }

  if (!mongoose.Types.ObjectId.isValid(assignedToId)) {
    return { error: "Invalid assigned user ID", statusCode: 400 };
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return { error: "Project not found", statusCode: 404 };
  }

  const assignee = await User.findById(assignedToId);
  if (!assignee) {
    return { error: "Assigned user not found", statusCode: 404 };
  }

  return { project, assignee };
};

/**
 * @route   POST /api/tasks
 * @desc    Create and assign a task (admin only)
 * @access  Admin
 */
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      dueDate,
      status,
    } = req.body;

    if (!title || !description || !project || !assignedTo) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, project, and assignedTo are required",
      });
    }

    const dueDateResult = parseDueDate(dueDate);
    if (dueDateResult.error) {
      return res.status(400).json({
        success: false,
        message: dueDateResult.error,
      });
    }

    if (status && !isValidStatus(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const validation = await validateProjectAndAssignee(project, assignedTo);
    if (validation.error) {
      return res.status(validation.statusCode).json({
        success: false,
        message: validation.error,
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      project,
      assignedTo,
      dueDate: dueDateResult.date,
      status: status || "Todo",
      createdBy: req.user._id,
    });

    const populatedTask = await populateTaskFields(Task.findById(task._id));

    res.status(201).json({
      success: true,
      message: "Task created and assigned successfully",
      task: populatedTask,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating task",
    });
  }
};

/**
 * @route   GET /api/tasks
 * @desc    Admin: all tasks | Member: only tasks assigned to them
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    const filter = isAdmin(req.user)
      ? {}
      : { assignedTo: req.user._id };

    const tasks = await populateTaskFields(
      Task.find(filter).sort({ createdAt: -1 })
    );

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tasks",
    });
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task (member only if assigned to them)
 * @access  Private
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await populateTaskFields(Task.findById(id));

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Members can only view tasks assigned to them
    if (!isAdmin(req.user) && !isAssignee(req.user, task)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this task",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get task by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching task",
    });
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task details including reassignment (admin only)
 * @access  Admin
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      project,
      assignedTo,
      dueDate,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Task title cannot be empty",
        });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Task description cannot be empty",
        });
      }
      task.description = description.trim();
    }

    if (status !== undefined) {
      if (!isValidStatus(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
        });
      }
      task.status = status;
    }

    if (project !== undefined || assignedTo !== undefined) {
      const projectId = project !== undefined ? project : task.project;
      const assigneeId =
        assignedTo !== undefined ? assignedTo : task.assignedTo;

      const validation = await validateProjectAndAssignee(
        projectId,
        assigneeId
      );
      if (validation.error) {
        return res.status(validation.statusCode).json({
          success: false,
          message: validation.error,
        });
      }

      task.project = projectId;
      task.assignedTo = assigneeId;
    }

    if (dueDate !== undefined) {
      const dueDateResult = parseDueDate(dueDate);
      if (dueDateResult.error) {
        return res.status(400).json({
          success: false,
          message: dueDateResult.error,
        });
      }
      task.dueDate = dueDateResult.date;
    }

    await task.save();

    const updatedTask = await populateTaskFields(Task.findById(id));

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating task",
    });
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task (admin only)
 * @access  Admin
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting task",
    });
  }
};

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update task status (admin OR assigned member)
 * @access  Private
 */
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!isValidStatus(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const task = await populateTaskFields(Task.findById(id));

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Only admin or the assigned member can update status
    if (!isAdmin(req.user) && !isAssignee(req.user, task)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task status",
      });
    }

    task.status = status;
    await task.save();

    const updatedTask = await populateTaskFields(Task.findById(id));

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating task status",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
