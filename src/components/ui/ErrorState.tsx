import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-card border border-danger/20 bg-danger/5 px-4 py-3",
          className
        )}
        role="alert"
      >
        <AlertTriangle size={16} className="shrink-0 text-danger" />
        <p className="text-sm text-text-strong">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto shrink-0 text-xs font-medium text-danger hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12 max-w-sm mx-auto",
        className
      )}
      role="alert"
    >
      <div
        className="h-16 w-16 rounded-card flex items-center justify-center mb-4"
        style={{ background: "color-mix(in srgb, var(--color-danger) 12%, transparent)" }}
      >
        <AlertTriangle size={28} className="text-danger" />
      </div>
      <h3 className="text-h4 font-semibold text-text-strong mb-2">{title}</h3>
      <p className="text-body text-text-muted leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="md"
          onClick={onRetry}
          leftIcon={<RefreshCw size={16} />}
          className="mt-6"
        >
          Try again
        </Button>
      )}
    </div>
  );
}
