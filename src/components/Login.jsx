import { useState } from "react";
import { FiMail, FiLock, FiMessageCircle } from "react-icons/fi";
import api from "../services/api";

const Login = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-brand-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.04),transparent_40%)]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center justify-center gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:gap-16 lg:px-10">
        <div className="hidden w-full max-w-md text-white lg:block">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-900/40">
              <FiMessageCircle className="h-7 w-7" />
            </div>
            <span className="text-4xl font-extrabold tracking-tight">ChatWave</span>
          </div>
          <p className="text-lg leading-relaxed text-brand-100/80">
            Fast, clear conversations with voice and video — designed for every screen.
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-900/40">
              <FiMessageCircle className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">ChatWave</h1>
            <p className="mt-2 text-sm text-brand-100/75">Sign in to continue chatting</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/30 sm:p-8"
          >
            <div className="mb-6 hidden lg:block">
              <h2 className="text-2xl font-bold text-ink">Welcome back</h2>
              <p className="mt-1 text-sm text-muted">Sign in to your account</p>
            </div>

            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Email
            </label>
            <div className="relative mb-4">
              <FiMail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="email"
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              />
            </div>

            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Password
            </label>
            <div className="relative mb-5">
              <FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="password"
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              />
            </div>

            {error && (
              <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="my-5 h-px bg-line" />

            <button
              type="button"
              onClick={onRegister}
              className="w-full rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800 transition hover:bg-brand-100"
            >
              Create new account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
