import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import PageCard from "../components/PageCard";
import { Cell, DataTable, EmptyRow, HeadCell } from "../components/DataTable";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import type { Role, User } from "../types";

const UsersPage = () => {
  const { token, currentUser, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<Role>("user");
  const [showCreatePopover, setShowCreatePopover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = currentUser?.role === "admin";

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const loadUsers = async () => {
    if (!token) return;
    const data = await apiRequest<{ users: User[] }>("/users", {}, token);
    setUsers(data.users);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadUsers();
      } finally {
        setInitialLoading(false);
      }
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreateUser = async () => {
    if (!token) return;
    if (!newUserName.trim()) {
      setError("User name is required.");
      return;
    }
    if (!newUserPassword || newUserPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    clearMessages();
    setLoading(true);
    try {
      await apiRequest(
        "/users",
        {
          method: "POST",
          body: JSON.stringify({
            name: newUserName.trim(),
            password: newUserPassword,
            role: newUserRole,
          }),
        },
        token,
      );
      await loadUsers();
      setSuccess("User created.");
      setNewUserName("");
      setNewUserPassword("");
      setNewUserRole("user");
      setShowCreatePopover(false);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: number, role: Role) => {
    if (!token) return;

    clearMessages();
    setLoading(true);
    try {
      await apiRequest(
        `/users/${userId}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({ role }),
        },
        token,
      );
      await loadUsers();
      setSuccess(`User ${userId} role updated.`);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!token) return;

    clearMessages();
    setLoading(true);
    try {
      await apiRequest(`/users/${userId}`, { method: "DELETE" }, token);
      await loadUsers();
      setSuccess(`User ${userId} deleted.`);
      if (currentUser?.id === userId) {
        logout();
      }
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <Navigate to="/bookings" replace />;
  }

  const actions = (
    <>
      <button
        className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        onClick={() => setShowCreatePopover((prev) => !prev)}
      >
        {showCreatePopover ? "Close form" : "New User"}
      </button>
      <button
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        onClick={() => void loadUsers()}
      >
        {loading ? <LoadingSpinner size="sm" label="Refreshing..." /> : "Refresh"}
      </button>
    </>
  );

  return (
    <PageCard title="Users" loading={initialLoading} loadingLabel="Loading users..." actions={actions}>
      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      <Modal
        open={showCreatePopover}
        title="Create User"
        onClose={() => setShowCreatePopover(false)}
      >
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="flex min-w-[180px] flex-col gap-1 text-sm font-medium text-slate-700">
            Name
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={newUserName}
              onChange={(event) => setNewUserName(event.target.value)}
              placeholder="New user name"
            />
          </label>
          <label className="flex min-w-[180px] flex-col gap-1 text-sm font-medium text-slate-700">
            Password
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              type="password"
              value={newUserPassword}
              onChange={(event) => setNewUserPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
          </label>
          <label className="flex min-w-[160px] flex-col gap-1 text-sm font-medium text-slate-700">
            Role
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={newUserRole}
              onChange={(event) => setNewUserRole(event.target.value as Role)}
            >
              <option value="user">user</option>
              <option value="owner">owner</option>
              <option value="admin">admin</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={handleCreateUser}
          >
            {loading ? (
              <LoadingSpinner size="sm" label="Processing..." />
            ) : (
              "Create User"
            )}
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
            <HeadCell>Name</HeadCell>
            <HeadCell>Role</HeadCell>
            <HeadCell>Change Role</HeadCell>
            <HeadCell>Delete</HeadCell>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <Cell>{user.id}</Cell>
              <Cell>{user.name}</Cell>
              <Cell>{user.role}</Cell>
              <Cell>
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  value={user.role}
                  onChange={(event) => void handleChangeRole(user.id, event.target.value as Role)}
                >
                  <option value="user">user</option>
                  <option value="owner">owner</option>
                  <option value="admin">admin</option>
                </select>
              </Cell>
              <Cell>
                <button
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading || user.id === currentUser.id}
                  onClick={() => void handleDeleteUser(user.id)}
                >
                  {loading ? <LoadingSpinner size="sm" /> : "Delete"}
                </button>
              </Cell>
            </tr>
          ))}
          {users.length === 0 ? <EmptyRow colSpan={5} message="No users found." /> : null}
        </tbody>
      </DataTable>
    </PageCard>
  );
};

export default UsersPage;
