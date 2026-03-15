import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import PageCard from "../components/PageCard";
import { Cell, DataTable, EmptyRow, HeadCell } from "../components/DataTable";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import type { BookingSummaryResponse } from "../types";

const ReportsPage = () => {
  const { token, currentUser } = useAuth();
  const [summary, setSummary] = useState<BookingSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const isAllowed = currentUser?.role === "owner" || currentUser?.role === "admin";

  const loadReports = async () => {
    if (!token) return;

    setError("");
    setLoading(true);
    try {
      const summaryData = await apiRequest<BookingSummaryResponse>("/bookings/summary", {}, token);
      setSummary(summaryData);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const actions = (
    <button
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={loading}
      onClick={() => void loadReports()}
    >
      {loading ? <LoadingSpinner size="sm" label="Refreshing..." /> : "Refresh"}
    </button>
  );

  if (!isAllowed) {
    return <Navigate to="/bookings" replace />;
  }

  return (
    <PageCard
      title="Reports"
      loading={initialLoading}
      loadingLabel="Loading reports..."
      actions={actions}
    >
      <Alert type="error" message={error} />

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Total Bookings</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{summary?.totalBookings ?? 0}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Users With Bookings</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {summary?.totalUsersWithBookings ?? 0}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-base font-semibold text-slate-900">Bookings Per User</h3>
        <DataTable>
          <thead>
            <tr>
              <HeadCell>User</HeadCell>
              <HeadCell>Role</HeadCell>
              <HeadCell>Total</HeadCell>
            </tr>
          </thead>
          <tbody>
            {(summary?.bookingsPerUser || []).map((row) => (
              <tr key={row.userId}>
                <Cell>{row.userName || `User #${row.userId}`}</Cell>
                <Cell>{row.userRole || "-"}</Cell>
                <Cell>{row.totalBookings}</Cell>
              </tr>
            ))}
            {(summary?.bookingsPerUser || []).length === 0 ? (
              <EmptyRow colSpan={3} message="No summary data." />
            ) : null}
          </tbody>
        </DataTable>
      </div>
    </PageCard>
  );
};

export default ReportsPage;
