import { useEffect, useMemo, useState } from "react";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import PageCard from "../components/PageCard";
import { Cell, DataTable, EmptyRow, HeadCell } from "../components/DataTable";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import type { Booking, BookingSummaryResponse, BookingSummaryRow } from "../types";

const toApiDateTime = (localDateTime: string) => new Date(localDateTime).toISOString();

const BookingsPage = () => {
  const { token, currentUser } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterUsers, setFilterUsers] = useState<BookingSummaryRow[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<"all" | number>("all");
  const [startTimeLocal, setStartTimeLocal] = useState("");
  const [endTimeLocal, setEndTimeLocal] = useState("");
  const [showCreatePopover, setShowCreatePopover] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    [bookings],
  );

  const canDeleteBooking = (booking: Booking) => {
    if (!currentUser) return false;
    if (currentUser.role === "admin" || currentUser.role === "owner") return true;
    return booking.userId === currentUser.id;
  };

  const canFilterByUser = currentUser?.role === "admin" || currentUser?.role === "owner";

  const clearMessages = () => {
    setError("");
    setSuccess("");
    setFormError("");
  };

  const loadBookings = async () => {
    if (!token) return;
    const query =
      canFilterByUser && selectedUserId !== "all" ? `?userId=${selectedUserId}` : "";
    const data = await apiRequest<{ bookings: Booking[] }>(`/bookings${query}`, {}, token);
    setBookings(data.bookings);
  };

  const loadFilterUsers = async () => {
    if (!token || !canFilterByUser) return;
    const summary = await apiRequest<BookingSummaryResponse>("/bookings/summary", {}, token);
    setFilterUsers(summary.bookingsPerUser);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadBookings(), loadFilterUsers()]);
      } finally {
        setInitialLoading(false);
      }
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedUserId]);

  const handleCreateBooking = async () => {
    if (!token) return;
    if (!startTimeLocal || !endTimeLocal) {
      setFormError("Please provide start and end times.");
      return;
    }

    clearMessages();
    setLoading(true);
    try {
      await apiRequest(
        "/bookings",
        {
          method: "POST",
          body: JSON.stringify({
            startTime: toApiDateTime(startTimeLocal),
            endTime: toApiDateTime(endTimeLocal),
          }),
        },
        token,
      );
      await loadBookings();
      setSuccess("Booking created.");
      setStartTimeLocal("");
      setEndTimeLocal("");
      setShowCreatePopover(false);
    } catch (requestError) {
      setFormError((requestError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!token) return;

    clearMessages();
    setLoading(true);
    try {
      await apiRequest(`/bookings/${bookingId}`, { method: "DELETE" }, token);
      await loadBookings();
      setSuccess(`Booking ${bookingId} deleted.`);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const actions = (
    <>
      {canFilterByUser ? (
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          disabled={loading}
          value={selectedUserId}
          onChange={(event) =>
            setSelectedUserId(event.target.value === "all" ? "all" : Number(event.target.value))
          }
        >
          <option value="all">All users</option>
          {filterUsers.map((row) => (
            <option key={row.userId} value={row.userId}>
              {row.userName || `User #${row.userId}`} (#{row.userId})
            </option>
          ))}
        </select>
      ) : null}
      <button
        className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        onClick={() => setShowCreatePopover((prev) => !prev)}
      >
        {showCreatePopover ? "Close form" : "New Booking"}
      </button>
      <button
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        onClick={() => void loadBookings()}
      >
        {loading ? <LoadingSpinner size="sm" label="Refreshing..." /> : "Refresh"}
      </button>
    </>
  );

  return (
    <PageCard
      title="Bookings"
      loading={initialLoading}
      loadingLabel="Loading bookings..."
      actions={actions}
    >
      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      <Modal open={showCreatePopover} title="Create Booking" onClose={() => setShowCreatePopover(false)}>
        <Alert type="error" message={formError} />
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <label className="flex min-w-[220px] flex-col gap-1 text-sm font-medium text-slate-700">
            Start
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              type="datetime-local"
              value={startTimeLocal}
              onChange={(event) => setStartTimeLocal(event.target.value)}
            />
          </label>
          <label className="flex min-w-[220px] flex-col gap-1 text-sm font-medium text-slate-700">
            End
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              type="datetime-local"
              value={endTimeLocal}
              onChange={(event) => setEndTimeLocal(event.target.value)}
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={handleCreateBooking}
          >
            {loading ? <LoadingSpinner size="sm" label="Processing..." /> : "Create Booking"}
          </button>
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            disabled={loading}
            onClick={() => setShowCreatePopover(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>

      <DataTable>
        <thead>
          <tr>
            <HeadCell>ID</HeadCell>
            <HeadCell>User</HeadCell>
            <HeadCell>Role</HeadCell>
            <HeadCell>Start</HeadCell>
            <HeadCell>End</HeadCell>
            <HeadCell>Actions</HeadCell>
          </tr>
        </thead>
        <tbody>
          {sortedBookings.map((booking) => (
            <tr key={booking.id}>
              <Cell>{booking.id}</Cell>
              <Cell>{booking.user.name}</Cell>
              <Cell>{booking.user.role}</Cell>
              <Cell>{new Date(booking.startTime).toLocaleString()}</Cell>
              <Cell>{new Date(booking.endTime).toLocaleString()}</Cell>
              <Cell>
                <button
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading || !canDeleteBooking(booking)}
                  onClick={() => void handleDeleteBooking(booking.id)}
                >
                  {loading ? <LoadingSpinner size="sm" /> : "Delete"}
                </button>
              </Cell>
            </tr>
          ))}
          {sortedBookings.length === 0 ? <EmptyRow colSpan={6} message="No bookings found." /> : null}
        </tbody>
      </DataTable>
    </PageCard>
  );
};

export default BookingsPage;
