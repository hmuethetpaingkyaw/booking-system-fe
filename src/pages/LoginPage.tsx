import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    return <Navigate to="/bookings" replace />;
  }

  const handleLogin = async () => {
    if (!name.trim() || !password) {
      setError("Name and password are required.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await login(name.trim(), password);
      navigate("/bookings", { replace: true });
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center p-5">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Login</h1>
        <p className="mb-4 text-sm text-slate-600">Login with your name and password.</p>
        <Alert type="error" message={error} />
        <label className="mb-3 flex flex-col gap-1 text-sm font-medium text-slate-700">
          Name
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="mb-4 flex flex-col gap-1 text-sm font-medium text-slate-700">
          Password
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button
          className="w-full rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading || !name.trim() || !password}
          onClick={handleLogin}
        >
          {loading ? <LoadingSpinner size="sm" label="Logging in..." /> : "Login"}
        </button>
      </section>
    </div>
  );
};

export default LoginPage;
