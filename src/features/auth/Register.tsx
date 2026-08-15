import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.signUp);
  const loading = useAuthStore((s) => s.loading);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setFormError(null);
    clearError();
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setFormError("Please enter a valid email.");
      return;
    }
    if (form.password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    const res = await signUp(form);
    if ("error" in res) {
      setFormError(res.error);
      return;
    }
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="container py-12 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        <div className="card">
          <h1>Create your account.</h1>
          <p className="mt-2 text-sm text-text-muted">
            It only takes a moment — then your groups are a click away.
          </p>
          <form className="mt-6 space-y-6" onSubmit={onSubmit} noValidate>
            <label className="block">
              <span className="text-sm font-medium mb-1 block" style={{ color: "var(--color-text-strong)" }}>
                Name
              </span>
              <input
                type="text"
                className="input"
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your name"
              />
            </label>
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
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="At least 8 characters"
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
              Create account
            </button>
          </form>
          <div className="mt-6 text-sm text-text-muted text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
