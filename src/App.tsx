import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ThemeToggle } from "./components/ThemeToggle";
import { Sidebar } from "./components/Sidebar";
import { ToastStack } from "./components/ToastStack";
import { HomePage } from "./pages/Home";
import { AboutPage } from "./pages/About";
import { ContactPage } from "./pages/Contact";
import { TemplatesPage } from "./pages/Templates";
import { DashboardPage } from "./pages/Dashboard";
import { CalendarView } from "./pages/CalendarView";
import { TrashPage } from "./pages/Trash";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { SettingsPage } from "./pages/Settings";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuthStore } from "./stores/authStore";

function Shell({
  variant,
  children,
}: {
  variant: "marketing" | "dashboard";
  children: React.ReactNode;
}) {
  const location = useLocation();
  if (variant === "dashboard") {
    return (
      <div className="min-h-screen flex flex-row bg-page">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="lg:hidden">
            <Navbar variant="simple" />
          </div>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-page" key={location.pathname}>
      <Navbar variant="marketing" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AuthHydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="animate-pulse text-text-strong font-semibold tracking-wide">
          Loading SimplLife…
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthHydrationGate>
        <Routes>
          <Route
            path="/"
            element={
              <Shell variant="marketing">
                <HomePage />
              </Shell>
            }
          />
          <Route
            path="/about"
            element={
              <Shell variant="marketing">
                <AboutPage />
              </Shell>
            }
          />
          <Route
            path="/contact"
            element={
              <Shell variant="marketing">
                <ContactPage />
              </Shell>
            }
          />
          <Route
            path="/templates"
            element={
              <Shell variant="marketing">
                <TemplatesPage />
              </Shell>
            }
          />
          <Route
            path="/login"
            element={
              <Shell variant="marketing">
                <LoginPage />
              </Shell>
            }
          />
          <Route
            path="/register"
            element={
              <Shell variant="marketing">
                <RegisterPage />
              </Shell>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Shell variant="dashboard">
                  <DashboardPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/calendar"
            element={
              <ProtectedRoute>
                <Shell variant="dashboard">
                  <CalendarView />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/trash"
            element={
              <ProtectedRoute>
                <Shell variant="dashboard">
                  <TrashPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Shell variant="dashboard">
                  <SettingsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ThemeToggle />
        <ToastStack />
      </AuthHydrationGate>
    </BrowserRouter>
  );
}
