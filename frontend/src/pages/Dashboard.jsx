/**
 * Dashboard page — shows task statistics from GET /api/dashboard
 */

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getDashboardStats } from "../services/dashboardService";

const statCards = [
  { key: "totalTasks", label: "Total Tasks", color: "bg-indigo-500" },
  { key: "completedTasks", label: "Completed Tasks", color: "bg-emerald-500" },
  { key: "pendingTasks", label: "Pending Tasks", color: "bg-amber-500" },
  { key: "overdueTasks", label: "Overdue Tasks", color: "bg-red-500" },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.dashboard);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard stats."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
      <p className="mt-1 text-sm text-slate-500">
        Overview of your task statistics
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-slate-500">Loading statistics...</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ key, label, color }) => (
            <div
              key={key}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className={`h-1.5 ${color}`} />
              <div className="p-5">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats?.[key] ?? 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
