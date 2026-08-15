import React from "react";
import { cn } from "@/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "subtle";
  size?: "sm" | "md";
}

export function Badge({
  variant = "subtle",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-badge font-semibold uppercase tracking-widest whitespace-nowrap",
        {
          "px-3 py-1 text-xs": size === "md",
          "px-2 py-0.5 text-xs": size === "sm",
        },
        {
          "bg-primary/10 text-primary border border-primary/20": variant === "primary",
          "bg-success/10 text-success border border-success/20": variant === "success",
          "bg-warning/10 text-warning border border-warning/20": variant === "warning",
          "bg-danger/10 text-danger border border-danger/20": variant === "danger",
          "bg-info/10 text-info border border-info/20": variant === "info",
          "bg-surface-alt text-text border border-border-subtle": variant === "subtle",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
