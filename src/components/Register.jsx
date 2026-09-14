import { useState } from "react";
import { FiMail, FiLock, FiUser, FiMessageCircle } from "react-icons/fi";
import api from "../services/api";

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);
      setMessage(response.data.message || "Account created");
      onRegister();
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-brand-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
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
            Create your account and start messaging friends in seconds.
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-900/40">
              <FiMessageCircle className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">ChatWave</h1>
            <p className="mt-2 text-sm text-brand-100/75">Create your account</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/30 sm:p-8"
          >
            <div className="mb-6 hidden lg:block">
              <h2 className="text-2xl font-bold text-ink">Create account</h2>
              <p className="mt-1 text-sm text-muted">Join ChatWave today</p>
            </div>

            <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Name
            </label>
            <div className="relative mb-4">
              <FiUser className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="name"
                type="text"
                name="name"
                required
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              />
            </div>

            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Email
            </label>
            <div className="relative mb-4">
              <FiMail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="email"
                type="email"
                name="email"
                required
                placeholder="you@email.com"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                required
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              />
            </div>

            {message && (
              <p
                className={`mb-4 rounded-xl px-3 py-2 text-center text-sm font-medium ${
                  isError ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-700"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
            </button>

            <div className="my-5 h-px bg-line" />

            <button
              type="button"
              onClick={onRegister}
              className="w-full rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800 transition hover:bg-brand-100"
            >
              Already have an account? Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
