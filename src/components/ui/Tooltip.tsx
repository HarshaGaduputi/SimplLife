import { useState, useRef, useId } from "react";
import { cn } from "@/utils/cn";

export interface TooltipProps {
  label: string;
  position?: "top" | "left" | "right" | "bottom";
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({
  label,
  position = "top",
  children,
  className,
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const id = useId();

  const open = () => {
    window.clearTimeout(timerRef.current);
    setShow(true);
  };

  const close = () => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setShow(false), 80);
  };

  const positionClasses: Record<string, string> = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      <span
        role="tooltip"
        id={id}
        className={cn(
          "pointer-events-none absolute whitespace-nowrap rounded-btn px-2.5 py-1.5 text-xs font-medium shadow-md transition-opacity duration-150 z-50",
          positionClasses[position],
          show ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: "var(--color-text-strong)",
          color: "var(--color-background)",
          visibility: show ? "visible" : "hidden",
        }}
      >
        {label}
      </span>
    </span>
  );
}
