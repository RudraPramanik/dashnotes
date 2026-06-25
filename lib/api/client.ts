import { handleUnauthorized } from "@/lib/auth/token-refresh";
import { useAuthStore } from "@/lib/stores/auth-store";

export type ApiError = {
  status: number;
  message: string;
  retryAfter?: number;
};

export class AiUnavailableError extends Error {
  status = 503;

  constructor(message = "AI service unavailable") {
    super(message);
    this.name = "AiUnavailableError";
  }
}

type RequestOptions = {
  method: string;
  body?: unknown;
  signal?: AbortSignal;
  isRetry?: boolean;
  skipAuthRefresh?: boolean;
};

function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw {
      status: 0,
      message: "API URL not configured",
    } satisfies ApiError;
  }

  return baseUrl;
}

function redirectToLogin(reason: string): void {
  if (typeof window !== "undefined") {
    window.location.assign(
      `/auth/login?reason=${encodeURIComponent(reason)}`,
    );
  }
}

function buildHeaders(options: RequestOptions): HeadersInit {
  const headers: Record<string, string> = {};

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (!options.skipAuthRefresh) {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return headers;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      detail?: string;
      message?: string;
    };

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (typeof data.message === "string") {
      return data.message;
    }
  } catch {
    // Response body is not JSON.
  }

  return response.statusText || "Request failed";
}

async function throwForErrorResponse(
  response: Response,
  path: string,
): Promise<never> {
  if (response.status === 429) {
    const retryAfterHeader = response.headers.get("Retry-After");
    const parsedRetryAfter = retryAfterHeader
      ? Number.parseInt(retryAfterHeader, 10)
      : undefined;

    throw {
      status: 429,
      message: "Rate limited",
      retryAfter:
        parsedRetryAfter !== undefined && !Number.isNaN(parsedRetryAfter)
          ? parsedRetryAfter
          : undefined,
    } satisfies ApiError;
  }

  if (response.status === 503 && path.startsWith("/ai/")) {
    throw new AiUnavailableError();
  }

  const message = await parseErrorMessage(response);

  throw {
    status: response.status,
    message,
  } satisfies ApiError;
}

async function fetchWithAuth(
  path: string,
  options: RequestOptions,
): Promise<Response> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: options.method,
    headers: buildHeaders(options),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (response.status === 401) {
    if (options.isRetry === true) {
      useAuthStore.getState().clearSession();
      redirectToLogin("unauthorized");
      throw {
        status: 401,
        message: "Unauthorized",
      } satisfies ApiError;
    }

    if (options.skipAuthRefresh) {
      const message = await parseErrorMessage(response);
      throw {
        status: 401,
        message,
      } satisfies ApiError;
    }

    const refreshed = await handleUnauthorized();
    if (!refreshed) {
      throw {
        status: 401,
        message: "Unauthorized",
      } satisfies ApiError;
    }

    return fetchWithAuth(path, { ...options, isRetry: true });
  }

  if (!response.ok) {
    await throwForErrorResponse(response, path);
  }

  return response;
}

async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const response = await fetchWithAuth(path, options);
  return (await response.json()) as T;
}

export const apiClient = {
  get<T>(path: string, signal?: AbortSignal): Promise<T> {
    return request<T>(path, { method: "GET", signal, isRetry: false });
  },

  post<T>(
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    return request<T>(path, { method: "POST", body, signal, isRetry: false });
  },

  patch<T>(
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    return request<T>(path, { method: "PATCH", body, signal, isRetry: false });
  },

  delete<T>(path: string, signal?: AbortSignal): Promise<T> {
    return request<T>(path, { method: "DELETE", signal, isRetry: false });
  },

  stream(
    path: string,
    body: unknown,
    signal?: AbortSignal,
  ): Promise<Response> {
    return fetchWithAuth(path, {
      method: "POST",
      body,
      signal,
      isRetry: false,
    });
  },
};
