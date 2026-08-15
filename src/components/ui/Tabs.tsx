import React, { useState, createContext, useContext } from "react";
import { cn } from "@/utils/cn";

// Context for tab state
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue>({
  activeTab: "",
  setActiveTab: () => {},
});

export interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
  className?: string;
  onTabChange?: (id: string) => void;
}

export function Tabs({ defaultTab, children, className, onTabChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    onTabChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export type TabListProps = React.HTMLAttributes<HTMLDivElement>;

export function TabList({ className, children, ...props }: TabListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 border-b border-border-subtle overflow-x-auto no-scrollbar",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function Tab({ id, label, icon, disabled }: TabProps) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === id;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tab-panel-${id}`}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(id)}
      className={cn(
        "relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap",
        {
          "text-primary": isActive,
          "text-text-muted hover:text-text-strong": !isActive && !disabled,
          "text-disabled-text cursor-not-allowed": disabled,
        }
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
      )}
    </button>
  );
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function TabPanel({ id, className, children, ...props }: TabPanelProps) {
  const { activeTab } = useContext(TabsContext);
  const isActive = activeTab === id;

  if (!isActive) return null;

  return (
    <div
      id={`tab-panel-${id}`}
      role="tabpanel"
      aria-labelledby={id}
      className={cn("py-4 animate-fade-in", className)}
      {...props}
    >
      {children}
    </div>
  );
}
