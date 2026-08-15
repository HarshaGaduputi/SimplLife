import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      aria-hidden
      className={className}
    >
      <path
        d="M4 22c3-5.2 7.5-8 12-8s9 2.8 12 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M8 20c1.5-3 4.2-5 8-5s6.5 2 8 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="22" r="2.2" fill="currentColor" />
      <path
        d="M10 13l2 2 4-4"
        fill="none"
        stroke="currentColor"
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
    { to: "/templates", label: "Templates" },
    { to: "/contact", label: "Contact" },
  ];

  if (variant === "simple") {
    return (
      <header
        className="lg:hidden sticky top-0 z-40 bg-panel border-b border-border"
      >
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarMobile(!sidebarOpenMobile)}
            aria-label="Toggle menu"
            className="h-10 w-10 rounded-lg flex items-center justify-center text-text-muted hover:text-text-strong hover:bg-surface-alt transition-colors"
          >
            {sidebarOpenMobile ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link
            to="/dashboard"
            className="flex items-center gap-2"
            aria-label="SimplLife"
          >
            <LogoMark className="text-text-strong" />
            <span className="font-sans font-bold text-base text-text-strong">
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
      className="sticky top-0 z-40 bg-panel border-b border-border"
    >
      <div className="container h-16 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 md:hidden"
          aria-label="SimplLife Home"
        >
          <LogoMark className="text-text-strong" />
          <span className="font-sans font-bold text-base text-text-strong">
            SimplLife
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                "text-sm font-medium transition-colors duration-200 " +
                (isActive ? "text-primary" : "text-text-muted hover:text-text-strong")
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
              className="btn-ghost"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="btn-ghost"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          className="md:hidden h-10 w-10 rounded-lg flex items-center justify-center text-text-muted hover:text-text-strong hover:bg-surface-alt transition-colors"
          aria-label="Toggle mobile menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-panel">
          <div className="container py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors " +
                  (isActive ? "text-primary" : "text-text-muted hover:text-text-strong hover:bg-surface-alt")
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
                className="mt-1 btn-ghost justify-start"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-1 btn-ghost"
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
