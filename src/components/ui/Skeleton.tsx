import React from "react";
import { cn } from "@/utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className, width, height, rounded = "md", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-alt",
        {
          "rounded-sm": rounded === "sm",
          "rounded-input": rounded === "md",
          "rounded-card": rounded === "lg",
          "rounded-full": rounded === "full",
        },
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

// Skeleton Text line
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="16px"
          className={i === lines - 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  );
}

// Skeleton Card
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-card p-6 space-y-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton width="40px" height="40px" rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton height="14px" className="w-1/2" />
          <Skeleton height="12px" className="w-1/4" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <Skeleton height="36px" className="w-24" rounded="sm" />
    </div>
  );
}

// Skeleton Avatar
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton width={`${size}px`} height={`${size}px`} rounded="full" />;
}
