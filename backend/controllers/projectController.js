/**
 * Project controller
 * Handles CRUD operations and adding members to projects
 */

const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");

/**
 * Reusable populate options so API responses include user details
 */
const populateProjectFields = (query) => {
  return query
    .populate("createdBy", "name email role")
    .populate("members", "name email role");
};

/**
 * @route   POST /api/projects
 * @desc    Create a new project (admin only)
 * @access  Admin
 */
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Project name and description are required",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      createdBy: req.user._id,
      members: [],
    });

    const populatedProject = await populateProjectFields(
      Project.findById(project._id)
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating project",
    });
  }
};

/**
 * @route   GET /api/projects
 * @desc    Get all projects (any logged-in user)
 * @access  Private
 */
const getProjects = async (req, res) => {
  try {
    const projects = await populateProjectFields(
      Project.find().sort({ createdAt: -1 })
    );

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching projects",
    });
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID (any logged-in user)
 * @access  Private
 */
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await populateProjectFields(Project.findById(id));

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching project",
    });
  }
};

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project (admin only)
 * @access  Admin
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Update only fields that were sent in the request body
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Project name cannot be empty",
        });
      }
      project.name = name.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Project description cannot be empty",
        });
      }
      project.description = description.trim();
    }

    if (name === undefined && description === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide name or description to update",
      });
    }

    await project.save();

    const updatedProject = await populateProjectFields(Project.findById(id));

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating project",
    });
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project (admin only)
 * @access  Admin
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting project",
    });
  }
};

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add a user to project members (admin only)
 * @access  Admin
 */
const addMemberToProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required to add a member",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Member must exist in the User collection
    const userToAdd = await User.findById(userId);

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent adding the same member twice
    const isAlreadyMember = project.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project",
      });
    }

    project.members.push(userId);
    await project.save();

    const updatedProject = await populateProjectFields(Project.findById(id));

    res.status(200).json({
      success: true,
      message: "Member added to project successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding member",
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMemberToProject,
};
