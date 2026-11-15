import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await login(email.trim().toLowerCase(), password);
      if (res.success) {
        navigate("/");
      } else {
        setError(res.message || "Invalid credentials.");
      }
    } catch (err) {
      setError(err.message || "Unable to connect to hospital server.");
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemoAdmin() {
    setEmail("admin@aethercare.com");
    setPassword("Admin12345678!");
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 mb-4">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            AetherCare
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connected Healthcare. Smarter Operations.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-3.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Staff Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hospital.com"
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-200 disabled:opacity-50"
          >
            <span>{submitting ? "Signing in..." : "Sign In to AetherCare"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Demo Helper */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-4"
          >
            Use Demo Admin Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
