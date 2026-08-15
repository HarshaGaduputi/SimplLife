import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, align = "right", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <div onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-48 rounded-btn bg-surface border border-border shadow-md py-1 animate-pop focus:outline-none",
            {
              "left-0 origin-top-left": align === "left",
              "right-0 origin-top-right": align === "right",
            }
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.disabled) return;
                item.onClick?.();
                setOpen(false);
              }}
              disabled={item.disabled}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors",
                {
                  "text-text hover:bg-hover": !item.danger && !item.disabled,
                  "text-danger hover:bg-danger/10": item.danger && !item.disabled,
                  "opacity-40 cursor-not-allowed": item.disabled,
                }
              )}
              role="menuitem"
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
