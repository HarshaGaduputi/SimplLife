/**
 * Core HTTP client — single place for fetch, auth headers, error handling.
 * All feature services import from here.
 */
import { BASE_URL } from "../../constants/config";

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | undefined>;
};

export class HttpError extends Error {
  readonly status: number;
  readonly issues?: string[];

  constructor(message: string, status: number, issues?: string[]) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.issues = issues;
  }
}

export async function request<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, headers, ...rest } = options;
  const url = new URL(BASE_URL + path, window.location.origin);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  const res = await fetch(url.toString(), { 
    ...rest, 
    headers: finalHeaders,
    credentials: "include" 
  });

  let body: unknown;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const isObj = body && typeof body === "object";
    const errMsg = (isObj && (body as { error?: string }).error) || res.statusText;
    const issues =
      isObj && Array.isArray((body as { issues?: unknown }).issues)
        ? ((body as { issues: unknown[] }).issues as string[])
        : undefined;
    throw new HttpError(errMsg, res.status, issues);
  }

  return body as T;
}
