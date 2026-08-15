import React from "react";
import { cn } from "@/utils/cn";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12 max-w-sm mx-auto",
        className
      )}
    >
      {icon && (
        <div
          className="h-16 w-16 rounded-card flex items-center justify-center mb-4 text-text-muted"
          style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
        >
          <span className="text-primary/60">{icon}</span>
        </div>
      )}
      <h3 className="text-h4 font-semibold text-text-strong mb-2">{title}</h3>
      {description && (
        <p className="text-body text-text-muted leading-relaxed">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-6 flex-wrap justify-center">
          {action && (
            <Button variant="primary" size="md" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" size="md" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
