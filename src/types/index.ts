/**
 * Shared frontend TypeScript type definitions.
 *
 * Domain types (User, Task, Group, Subtask, etc.) live in the shared/types.ts
 * package so they can be consumed by both frontend and backend.
 *
 * This file re-exports everything from shared/types for convenient frontend imports,
 * and defines any frontend-only types below.
 */
export type {
  User,
  Group,
  Task,
  Subtask,
  PriorityLevel,
  ActivityLog,
  TrashData,
  ExportData,
} from "../../shared/types";

// ─── UI Types ────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark";

export type ToastKind = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  kind: ToastKind;
  message: string;
  durationMs?: number;
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type BadgeVariant = "primary" | "success" | "warning" | "danger" | "info" | "subtle";

export type SizeVariant = "sm" | "md" | "lg";

// ─── API Types ───────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  issues?: string[];
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
