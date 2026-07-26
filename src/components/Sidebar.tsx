import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Trash2,
  Settings,
  Layers3,
  Plus,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useUIStore, useTasksStore } from "../stores/uiStore";
import { api } from "../lib/api";

export function Sidebar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const sidebarOpenMobile = useUIStore((s) => s.sidebarOpenMobile);
  const setSidebarMobile = useUIStore((s) => s.setSidebarMobile);
  const trashBadgeCount = useUIStore((s) => s.trashBadgeCount);
  const setTrashBadgeCount = useUIStore((s) => s.setTrashBadgeCount);
  const toast = useUIStore((s) => s.toast);
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
    api
      .listTrash()
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

  const newGroup = async () => {
    const name = window.prompt(
      "Name your new group (e.g. Harsha, Shopping, Marketing)",
    );
    if (!name) return;
    setCreating(true);
    try {
      const res = await api.createGroup(name.trim());
      const fresh = await api.listGroups();
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
      setCreating(false);
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
          "relative z-50 w-[248px] min-h-screen shrink-0 flex-col hidden lg:flex " +
          (sidebarOpenMobile
            ? "!flex fixed left-0 top-0 bottom-0 shadow-2xl animate-fade-in"
            : "")
        }
        style={{ background: "var(--color-panel)" }}
      >
        <div
          className="h-16 flex items-center gap-2.5 px-5 border-b shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
            <path
              d="M4 22c3-5.2 7.5-8 12-8s9 2.8 12 8"
              fill="none"
              stroke="var(--color-pearl-perfect, #FFFFFF)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M8 20c1.5-3 4.2-5 8-5s6.5 2 8 5"
              fill="none"
              stroke="var(--color-pearl-perfect, #FFFFFF)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="16" cy="22" r="2" fill="var(--color-pearl-perfect, #FFFFFF)" />
          </svg>
          <div
            className="font-display font-bold text-xl tracking-tight"
            style={{ color: "var(--color-pearl-perfect, #FFFFFF)" }}
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

          <div
            className="my-2 border-t"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          />

          <SidebarNavLink
            to="/templates"
            icon={<Layers3 size={18} />}
            label="Templates"
            onClick={() => setSidebarMobile(false)}
          />
        </div>

        <div
          className="p-4 mt-auto border-t shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={newGroup}
            disabled={creating}
            className="btn-primary w-full"
            style={{
              background: "var(--color-ocean, #5B88B2)",
              color: "var(--color-noir, #000000)",
            }}
          >
            <Plus size={18} />
            New Group
          </button>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div
                className="text-sm font-semibold truncate"
                style={{ color: "var(--color-pearl-perfect, #FFFFFF)" }}
              >
                {user?.name ?? "Signed out"}
              </div>
              <div className="text-[11px] text-white/60 truncate">
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
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
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
        "sidebar-nav-item flex items-center justify-between " +
        (isActive ? "sidebar-nav-item-active" : "text-white/80 hover:text-white")
      }
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      {typeof badgeCount === "number" && badgeCount > 0 && (
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-xs font-bold shrink-0"
          style={{
            background: "#EF4444",
            color: "#FFFFFF",
          }}
        >
          {badgeCount}
        </span>
      )}
    </NavLink>
  );
}
