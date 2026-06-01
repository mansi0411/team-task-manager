/**
 * Navbar — navigation links for logged-in users
 */

import { Link, useNavigate } from "react-router-dom";
import { logout, getUser } from "../services/authService";

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass =
    "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors";

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-indigo-600 sm:text-xl">
            Team Task Manager
          </h1>
          {user && (
            <p className="text-xs text-slate-500 sm:text-sm">
              {user.name} ·{" "}
              <span className="capitalize">{user.role}</span>
            </p>
          )}
        </div>

        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Link to="/dashboard" className={linkClass}>
            Dashboard
          </Link>
          <Link to="/projects" className={linkClass}>
            Projects
          </Link>
          <Link to="/tasks" className={linkClass}>
            Tasks
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
