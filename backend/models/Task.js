/**
 * Task model
 * Tasks belong to a project and are assigned to a team member
 */

const mongoose = require("mongoose");

// Allowed status values (must match exactly when updating)
const TASK_STATUSES = ["Todo", "In Progress", "Completed"];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: "Status must be Todo, In Progress, or Completed",
      },
      default: "Todo",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned user is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

// Export statuses so controller can validate without duplicating strings
Task.TASK_STATUSES = TASK_STATUSES;

module.exports = Task;
