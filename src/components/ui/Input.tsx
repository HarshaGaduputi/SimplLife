import React, { forwardRef, useId } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, disabled, id: customId, ...props }, ref) => {
    const defaultId = useId();
    const id = customId || defaultId;

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className={cn("text-xs font-semibold uppercase tracking-wider text-text-strong", {
              "opacity-50": disabled,
            })}
          >
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full rounded-input px-4 py-3 text-sm transition-all duration-200 bg-surface border border-border placeholder:text-text-muted text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed",
            {
              "border-danger focus:border-danger focus:ring-danger/20": error,
            },
            className
          )}
          {...props}
        />
        {error && (
          <p role="alert" className="text-xs text-danger font-medium mt-0.5">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-text-muted mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
