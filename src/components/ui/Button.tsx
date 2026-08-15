import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { Loader } from "./Loader";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-button font-medium rounded-btn select-none whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          {
            "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm":
              variant === "primary",
            "bg-transparent text-text-strong border border-border hover:bg-hover":
              variant === "secondary",
            "bg-transparent text-text hover:bg-hover": variant === "ghost",
            "bg-danger text-danger-foreground hover:bg-danger-hover shadow-sm":
              variant === "danger",
          },
          {
            "px-3 py-1.5 text-xs gap-1": size === "sm",
            "px-4 py-2 text-sm gap-2": size === "md",
            "px-6 py-3 text-base gap-3": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading && <Loader size="sm" className="text-current shrink-0" />}
        {!loading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
