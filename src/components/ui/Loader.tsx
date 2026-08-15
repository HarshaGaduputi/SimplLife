import React from "react";
import { cn } from "@/utils/cn";

export interface LoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "current";
  fullscreen?: boolean;
  className?: string;
}

export function Loader({
  size = "md",
  variant = "primary",
  fullscreen = false,
  className,
}: LoaderProps) {
  const spinner = (
    <svg
      className={cn(
        "animate-spinner shrink-0",
        {
          "h-4 w-4": size === "sm",
          "h-8 w-8": size === "md",
          "h-12 w-12": size === "lg",
        },
        {
          "text-primary": variant === "primary",
          "text-current": variant === "current",
        },
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-xs">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <span className="text-sm font-medium tracking-wide text-text-muted animate-pulse">
            Loading SimplLife…
          </span>
        </div>
      </div>
    );
  }

  return spinner;
}
