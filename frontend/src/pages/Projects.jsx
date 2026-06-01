/**
 * Projects page — list projects; admin can create new projects
 */

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { isAdmin } from "../services/authService";
import { getProjects, createProject } from "../services/projectService";

const Projects = () => {
  const admin = isAdmin();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await createProject(form.name, form.description);
      setSuccess("Project created successfully!");
      setForm({ name: "", description: "" });
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
      <p className="mt-1 text-sm text-slate-500">
        {admin ? "Manage team projects" : "View all projects"}
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

      {/* Admin-only: create project form */}
      {admin && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <h3 className="font-semibold text-slate-800">Create Project</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-8 text-slate-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="mt-8 text-slate-500">No projects yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project._id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900">{project.name}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {project.description}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Created by: {project.createdBy?.name || "Unknown"}
              </p>
              <p className="text-xs text-slate-500">
                Members: {project.members?.length || 0}
              </p>
            </article>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Projects;
