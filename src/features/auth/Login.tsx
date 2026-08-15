import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/dashboard";
  const signIn = useAuthStore((s) => s.signIn);
  const loading = useAuthStore((s) => s.loading);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [form, setForm] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setFormError(null);
    clearError();
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError(null);
    if (!form.email || !form.password) {
      setFormError("Please enter both your email and password.");
      return;
    }
    const res = await signIn(form);
    if ("error" in res) {
      setFormError(res.error);
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <div className="container py-12 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        <div className="card">
          <h1>Welcome back.</h1>
          <p className="mt-2 text-sm text-text-muted">
            Sign in to your SimplLife dashboard.
          </p>
          <form className="mt-6 space-y-6" onSubmit={onSubmit} noValidate>
            <label className="block">
              <span className="text-sm font-medium mb-1 block" style={{ color: "var(--color-text-strong)" }}>
                Email
              </span>
              <input
                type="email"
                className="input"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1 block" style={{ color: "var(--color-text-strong)" }}>
                Password
              </span>
              <input
                type="password"
                className="input"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="••••••••"
              />
            </label>
            {(formError || storeError) && (
              <div
                className="rounded-2xl p-3 text-sm border"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-danger) 10%, transparent)",
                  color: "var(--color-danger)",
                  borderColor:
                    "color-mix(in srgb, var(--color-danger) 35%, transparent)",
                }}
              >
                {formError || storeError}
              </div>
            )}
            <button className="btn-primary w-full h-12" disabled={loading}>
              {loading && <Loader2 size={18} className="animate-spin" />}
              Sign in
            </button>
          </form>
          <div className="mt-6 text-sm text-text-muted text-center">
            No account yet?{" "}
            <Link
              to="/register"
              className="font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
