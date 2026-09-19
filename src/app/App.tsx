import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";

import { Sidebar } from "@/layouts/Sidebar";
import { ToastStack } from "@/features/notifications/ToastStack";
import { HomePage } from "@/features/marketing/Home";
import { ContactPage } from "@/features/marketing/Contact";
import { TermsPage, PrivacyPage } from "@/features/marketing/Legal";
import { TemplatesPage } from "@/features/templates/Templates";
import { DashboardPage } from "@/features/dashboard/Dashboard";
import { CalendarView } from "@/features/calendar/CalendarView";
import { TrashPage } from "@/features/tasks/Trash";
import { LoginPage } from "@/features/auth/Login";
import { RegisterPage } from "@/features/auth/Register";
import { SettingsPage } from "@/features/settings/Settings";
import { GoalsPage } from "@/features/goals/Goals";
import { HabitsPage } from "@/features/habits/Habits";
import { FocusPage } from "@/features/focus/FocusMode";
import { NotesPage } from "@/features/notes/Notes";
import { JournalPage } from "@/features/journal/Journal";
import { AnalyticsPage } from "@/features/analytics/Analytics";
import { ProtectedRoute } from "@/layouts/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { AIChat, AIChatButton } from "@/features/ai/AIChat";
import { CommandPalette } from "@/features/ai/CommandPalette";

import { NotificationBanner } from "@/features/notifications/NotificationBanner";

function Shell({
  variant,
  children,
}: {
  variant: "marketing" | "dashboard";
  children: React.ReactNode;
}) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const isAuthenticated = !!useAuthStore((s) => s.user);
  const location = useLocation();

  // Global Cmd+K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (variant === "dashboard") {
    return (
      <div className="min-h-screen flex flex-row bg-page">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="lg:hidden">
            <Navbar variant="simple" />
          </div>
          <main className="flex-1 min-w-0 p-4">
            <NotificationBanner />
            {children}
          </main>
        </div>
        {isAuthenticated && (
          <>
            <AIChatButton />
            <AIChat />
            <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
          </>
        )}
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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-page-enter">
      {children}
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl font-bold text-primary opacity-20 mb-4">404</div>
      <h1 className="text-3xl font-bold text-text-strong mb-3">Page not found</h1>
      <p className="text-text-muted mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn-primary h-12 px-6">
        Go to Dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthHydrationGate>
        <ScrollToTop />
        <Routes>
          <Route
            path="/"
            element={
              <Shell variant="marketing">
                <PageTransition>
                  <HomePage />
                </PageTransition>
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
            path="/terms"
            element={
              <Shell variant="marketing">
                <TermsPage />
              </Shell>
            }
          />
          <Route
            path="/privacy"
            element={
              <Shell variant="marketing">
                <PrivacyPage />
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
          <Route
            path="/dashboard/goals"
            element={
              <ProtectedRoute>
                <Shell variant="dashboard">
                  <GoalsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/habits"
            element={
              <ProtectedRoute>
                <Shell variant="dashboard">
                  <HabitsPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/focus"
            element={
              <ProtectedRoute>
                <Shell variant="dashboard">
                  <FocusPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/notes"
            element={
              <ProtectedRoute>
                <Shell variant="dashboard">
                  <NotesPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/journal"
            element={
              <ProtectedRoute>
                <Shell variant="dashboard">
                  <JournalPage />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <ProtectedRoute>
                <Shell variant="dashboard">
                  <AnalyticsPage />
                </Shell>
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <Shell variant="marketing">
                <NotFoundPage />
              </Shell>
            }
          />
        </Routes>
        <ToastStack />
      </AuthHydrationGate>
    </BrowserRouter>
  );
}
