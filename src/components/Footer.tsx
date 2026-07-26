import { Link } from "react-router-dom";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-16 border-t"
      style={{ borderColor: "var(--color-border-subtle)" }}
    >
      <div className="container py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden>
            <path
              d="M4 22c3-5.2 7.5-8 12-8s9 2.8 12 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ color: "var(--color-text-strong)" }}
            />
            <path
              d="M8 20c1.5-3 4.2-5 8-5s6.5 2 8 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              style={{ color: "var(--color-text-strong)" }}
            />
          </svg>
          <div>
            <div
              className="font-display font-bold text-lg"
              style={{ color: "var(--color-text-strong)" }}
            >
              SimplLife
            </div>
            <p className="text-xs text-text-muted -mt-0.5">
              Your tasks. Your people. One place.
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-5 text-sm text-text-muted">
          <Link to="/" className="hover:text-text-strong transition-colors">
            Home
          </Link>
          <Link to="/about" className="hover:text-text-strong transition-colors">
            About
          </Link>
          <Link to="/templates" className="hover:text-text-strong transition-colors">
            Templates
          </Link>
          <Link to="/contact" className="hover:text-text-strong transition-colors">
            Contact
          </Link>
          <span className="text-xs">© {year} SimplLife</span>
        </nav>
      </div>
      <div
        className="border-t py-4 text-center text-xs text-text-muted"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        Made with care for people who think in lists.
      </div>
    </footer>
  );
}
