import { NavLink, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Trash2,
  Settings,
  Layers3,
  Plus,
  LogOut,
  Target,
  Repeat,
  Zap,
  FileText,
  BookOpen,
  BarChart2
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useTasksStore } from "@/stores/tasksStore";
import { useToastStore } from "@/stores/toastStore";
import { trashService, groupsService } from "@/services/api";

export function Sidebar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const sidebarOpenMobile = useUIStore((s) => s.sidebarOpenMobile);
  const setSidebarMobile = useUIStore((s) => s.setSidebarMobile);
  const trashBadgeCount = useUIStore((s) => s.trashBadgeCount);
  const setTrashBadgeCount = useUIStore((s) => s.setTrashBadgeCount);
  const toast = useToastStore((s) => s.toast);
  const setGroups = useTasksStore((s) => s.setGroups);
  const setTasks = useTasksStore((s) => s.setTasks);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setSidebarMobile(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [setSidebarMobile]);

  useEffect(() => {
    if (!user) return;
    trashService
      .list()
      .then((res) => {
        const total =
          (res.groups?.length || 0) +
          (res.tasks?.length || 0) +
          (res.subtasks?.length || 0);
        setTrashBadgeCount(total);
      })
      .catch(() => {
        /* ignore badge error */
      });
  }, [user, setTrashBadgeCount]);

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const confirmNewGroup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newGroupName.trim();
    if (!name) {
      setIsCreatingGroup(false);
      return;
    }
    setCreating(true);
    try {
      const res = await groupsService.create(name.trim());
      const fresh = await groupsService.list();
      setGroups(fresh.groups as never);
      setTasks(res.group.id, []);
      toast({ kind: "success", message: `Group "${res.group.name}" created` });
    } catch (e) {
      toast({
        kind: "error",
        message:
          e instanceof Error ? e.message : "Could not create group. Try again.",
      });
    } finally {
      setIsCreatingGroup(false);
      setNewGroupName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsCreatingGroup(false);
      setNewGroupName("");
    }
  };

  return (
    <>
      {sidebarOpenMobile && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50 animate-fade-in"
          onClick={() => setSidebarMobile(false)}
          aria-hidden
        />
      )}
      <aside
        className={
          "relative z-50 w-56 min-h-screen shrink-0 flex-col hidden lg:flex border-r border-border bg-[var(--color-surface)] " +
          (sidebarOpenMobile
            ? "!flex fixed left-0 top-0 bottom-0 animate-fade-in"
            : "")
        }
      >
        <div
          className="h-16 flex items-center gap-2 px-4 border-b border-border shrink-0"
        >
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
            <path
              d="M4 22c3-5.2 7.5-8 12-8s9 2.8 12 8"
              fill="none"
              stroke="var(--sidebar-text)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M8 20c1.5-3 4.2-5 8-5s6.5 2 8 5"
              fill="none"
              stroke="var(--sidebar-text)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="16" cy="22" r="2" fill="var(--sidebar-text)" />
          </svg>
          <div
            className="font-sans font-bold text-base tracking-tight text-[var(--sidebar-text)]"
          >
            SimplLife
          </div>
        </div>



        <div className="flex-1 flex flex-col gap-1 p-3">
          <SidebarNavLink
            to="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            onClick={() => setSidebarMobile(false)}
          />
          <SidebarNavLink
            to="/dashboard/calendar"
            icon={<CalendarIcon size={18} />}
            label="Calendar"
            onClick={() => setSidebarMobile(false)}
          />
          <SidebarNavLink
            to="/trash"
            icon={<Trash2 size={18} />}
            label="Trash"
            badgeCount={trashBadgeCount}
            onClick={() => setSidebarMobile(false)}
          />
          <SidebarNavLink
            to="/settings"
            icon={<Settings size={18} />}
            label="Settings"
            onClick={() => setSidebarMobile(false)}
          />

          <div className="my-2 border-t border-[var(--color-border-subtle)]" />

          <SidebarNavLink
            to="/templates"
            icon={<Layers3 size={18} />}
            label="Templates"
            onClick={() => setSidebarMobile(false)}
          />
          <SidebarNavLink
            to="/dashboard/goals"
            icon={<Target size={18} />}
            label="Goals"
            onClick={() => setSidebarMobile(false)}
          />
          <SidebarNavLink
            to="/dashboard/habits"
            icon={<Repeat size={18} />}
            label="Habits"
            onClick={() => setSidebarMobile(false)}
          />
          <SidebarNavLink
            to="/dashboard/focus"
            icon={<Zap size={18} />}
            label="Focus"
            onClick={() => setSidebarMobile(false)}
          />
          <SidebarNavLink
            to="/dashboard/notes"
            icon={<FileText size={18} />}
            label="Notes"
            onClick={() => setSidebarMobile(false)}
          />
          <SidebarNavLink
            to="/dashboard/journal"
            icon={<BookOpen size={18} />}
            label="Journal"
            onClick={() => setSidebarMobile(false)}
          />
          <SidebarNavLink
            to="/dashboard/analytics"
            icon={<BarChart2 size={18} />}
            label="Analytics"
            onClick={() => setSidebarMobile(false)}
          />

        </div>

        <div
          className="p-4 mt-auto border-t border-[var(--color-border-subtle)] shrink-0 space-y-4"
        >
          {isCreatingGroup ? (
            <form onSubmit={confirmNewGroup} className="flex items-center gap-2">
              <input
                autoFocus
                className="input w-full h-10 text-sm"
                placeholder="Group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => confirmNewGroup()}
                disabled={creating}
              />
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingGroup(true)}
              className="btn-primary w-full h-10"
            >
              <Plus size={18} />
              New Group
            </button>
          )}

          <div className="flex justify-center">
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div
                className="text-sm font-semibold truncate text-[var(--sidebar-text)]"
              >
                {user?.name ?? "Signed out"}
              </div>
              <div className="text-xs truncate text-[var(--sidebar-text-muted)]">
                {user?.email ?? ""}
              </div>
            </div>
            {user && (
              <button
                aria-label="Sign out"
                onClick={() => {
                  signOut();
                  navigate("/");
                }}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-active-bg)] transition-colors"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarNavLink({
  to,
  icon,
  label,
  badgeCount,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  badgeCount?: number;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      onClick={onClick}
      className={({ isActive }) =>
        "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-150 " +
        (isActive
          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold"
          : "text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]")
      }
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      {typeof badgeCount === "number" && badgeCount > 0 && (
        <span className="ml-auto rounded-full px-2 py-0.5 text-xs font-bold shrink-0 bg-primary text-primary-foreground">
          {badgeCount}
        </span>
      )}
    </NavLink>
  );
}
