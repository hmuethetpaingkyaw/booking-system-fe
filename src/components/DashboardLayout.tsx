import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const isActivePath = (pathname: string, target: string) =>
  pathname === target || pathname.startsWith(`${target}/`);

const DashboardLayout = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navLinkClass = (target: string) =>
    isActivePath(location.pathname, target)
      ? "rounded-full border border-blue-300 bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-800"
      : "rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100";

  const roleLabel = (currentUser?.role || "-").toUpperCase();

  return (
    <div className="mx-auto max-w-6xl p-5">
      <header className="mb-4 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Booking System</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 md:text-sm">
              <span className="mr-1.5">👤</span>
              {currentUser?.name || "-"}
            </span>
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
              {roleLabel}
            </span>
            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        <nav className="mt-4 flex flex-wrap gap-2">
          <Link className={navLinkClass("/bookings")} to="/bookings">
            Bookings
          </Link>
          {currentUser?.role === "owner" || currentUser?.role === "admin" ? (
            <Link className={navLinkClass("/reports")} to="/reports">
              Reports
            </Link>
          ) : null}
          {currentUser?.role === "admin" ? (
            <Link className={navLinkClass("/users")} to="/users">
              Users
            </Link>
          ) : null}
        </nav>
      </header>
      <Outlet />
    </div>
  );
};

export default DashboardLayout;
