import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";

function LogoMark({ color }: { color: "light" | "dark" }) {
  const stroke = color === "light" ? "var(--color-pearl-perfect)" : "var(--color-venice-blue)";
  const fill = "none";
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
      <path
        d="M4 22c3-5.2 7.5-8 12-8s9 2.8 12 8"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M8 20c1.5-3 4.2-5 8-5s6.5 2 8 5"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="22" r="2.2" fill={stroke} />
      <path
        d="M10 13l2 2 4-4"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Navbar({
  variant = "marketing",
}: {
  variant?: "marketing" | "simple";
}) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const setSidebarMobile = useUIStore((s) => s.setSidebarMobile);
  const sidebarOpenMobile = useUIStore((s) => s.sidebarOpenMobile);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/templates", label: "Templates" },
    { to: "/contact", label: "Contact" },
  ];

  if (variant === "simple") {
    return (
      <header
        className="lg:hidden sticky top-0 z-40 border-b"
        style={{
          background: "var(--color-panel)",
          borderColor: "var(--color-border-subtle)",
        }}
      >
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarMobile(!sidebarOpenMobile)}
            aria-label="Toggle menu"
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ color: "var(--color-pearl-perfect, #FFFFFF)" }}
          >
            {sidebarOpenMobile ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link
            to="/dashboard"
            className="flex items-center gap-2"
            aria-label="SimplLife"
          >
            <LogoMark color="light" />
            <span
              className="font-display font-bold text-lg"
              style={{ color: "var(--color-pearl-perfect)" }}
            >
              SimplLife
            </span>
          </Link>
          <div className="w-10" />
        </div>
      </header>
    );
  }

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur"
      style={{
        background: "var(--color-panel)",
      }}
    >
      <div className="container h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" aria-label="SimplLife Home">
          <LogoMark color="light" />
          <span
            className="font-display font-bold text-xl tracking-tight"
            style={{ color: "var(--color-pearl-perfect, #FFFFFF)" }}
          >
            SimplLife
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                "px-3.5 py-2 rounded-xl text-sm font-medium transition-colors duration-200 " +
                (isActive
                  ? "bg-white/10 text-white"
                  : "text-white/80 hover:text-white hover:bg-white/10")
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                "ml-2 btn-nav-cta " +
                (isActive ? "opacity-100" : "")
              }
            >
              Dashboard
            </NavLink>
          ) : (
            <NavLink to="/dashboard" className="ml-2 btn-nav-cta">
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <button
              onClick={() => {
                signOut();
                navigate("/");
              }}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          className="md:hidden h-10 w-10 rounded-xl flex items-center justify-center"
          aria-label="Toggle mobile menu"
          onClick={() => setMobileOpen((v) => !v)}
          style={{ color: "var(--color-pearl-perfect)" }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{
            background: "var(--color-panel)",
            borderColor: "var(--color-border-subtle)",
          }}
        >
          <div className="container py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  "px-3 py-2.5 rounded-xl text-sm font-medium " +
                  (isActive
                    ? "bg-white/10 text-white"
                    : "text-white/85 hover:bg-white/10 hover:text-white")
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="btn-primary mt-2 justify-center"
            >
              Dashboard
            </Link>
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileOpen(false);
                  navigate("/");
                }}
                className="mt-1 px-3 py-2.5 rounded-xl text-left text-sm text-white/85 hover:bg-white/10"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-1 px-3 py-2.5 rounded-xl text-sm text-white/85 hover:bg-white/10"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
