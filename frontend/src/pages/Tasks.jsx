/**
 * Tasks page — list tasks; admin creates tasks; members update status
 */

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { isAdmin, getUser } from "../services/authService";
import { getTasks, createTask, updateTaskStatus } from "../services/taskService";
import { getProjects } from "../services/projectService";

const TASK_STATUSES = ["Todo", "In Progress", "Completed"];

const Tasks = () => {
  const admin = isAdmin();
  const currentUser = getUser();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assigneeOptions, setAssigneeOptions] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    dueDate: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data.projects || []);
    } catch {
      // Non-admin may still view tasks; projects needed for admin create form
    }
  };

  useEffect(() => {
    loadTasks();
    if (admin) {
      loadProjects();
    }
  }, [admin]);

  // When admin selects a project, build assignee list from project members
  useEffect(() => {
    if (!form.project) {
      setAssigneeOptions([]);
      return;
    }

    const selected = projects.find((p) => p._id === form.project);
    if (!selected) return;

    const members = selected.members || [];
    const options = [...members];

    // Include project creator if not already in members list
    if (selected.createdBy) {
      const creatorId = selected.createdBy._id || selected.createdBy;
      const exists = options.some(
        (m) => (m._id || m).toString() === creatorId.toString()
      );
      if (!exists && typeof selected.createdBy === "object") {
        options.push(selected.createdBy);
      }
    }

    setAssigneeOptions(options);
    setForm((prev) => ({ ...prev, assignedTo: "" }));
  }, [form.project, projects]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await createTask(form);
      setSuccess("Task created successfully!");
      setForm({
        title: "",
        description: "",
        project: "",
        assignedTo: "",
        dueDate: "",
      });
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    setError("");
    setSuccess("");

    try {
      await updateTaskStatus(taskId, status);
      setSuccess("Task status updated!");
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    }
  };

  // Member can only update status on tasks assigned to them
  const canUpdateStatus = (task) => {
    if (admin) return true;
    const assigneeId = task.assignedTo?._id || task.assignedTo;
    return assigneeId?.toString() === currentUser?._id?.toString();
  };

  const statusBadge = (status) => {
    const styles = {
      Todo: "bg-slate-100 text-slate-700",
      "In Progress": "bg-blue-100 text-blue-700",
      Completed: "bg-emerald-100 text-emerald-700",
    };
    return (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.Todo}`}
      >
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-900">Tasks</h2>
      <p className="mt-1 text-sm text-slate-500">
        {admin ? "Create and manage tasks" : "View and update your assigned tasks"}
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Admin-only: create task form */}
      {admin && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <h3 className="font-semibold text-slate-800">Create Task</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Due Date
              </label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                required
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Project
              </label>
              <select
                required
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Assign To
              </label>
              <select
                required
                value={form.assignedTo}
                onChange={(e) =>
                  setForm({ ...form, assignedTo: e.target.value })
                }
                disabled={!form.project}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100"
              >
                <option value="">
                  {assigneeOptions.length
                    ? "Select member"
                    : "Add members to project first"}
                </option>
                {assigneeOptions.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || !form.assignedTo}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Task"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-8 text-slate-500">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="mt-8 text-slate-500">No tasks found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {tasks.map((task) => (
            <article
              key={task._id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {task.title}
                    </h3>
                    {statusBadge(task.status)}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {task.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Project: {task.project?.name || "—"}</span>
                    <span>
                      Assigned: {task.assignedTo?.name || "—"}
                    </span>
                    <span>
                      Due:{" "}
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Status update: admin or assigned member */}
                {canUpdateStatus(task) && task.status !== "Completed" && (
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <label className="text-xs font-medium text-slate-500">
                      Update status
                    </label>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task._id, e.target.value)
                      }
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      {TASK_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Tasks;
