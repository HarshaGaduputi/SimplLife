export function uid(prefix = "id"): string {
  return (
    prefix +
    "-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

export function now(): string {
  return new Date().toISOString();
}

export class ApiError extends Error {
  statusCode: number;
  issues?: unknown;

  constructor(message: string, statusCode = 400, issues?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.issues = issues;
  }
}
