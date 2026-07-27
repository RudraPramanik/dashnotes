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

async function executeWithAuthRetry<T>(
  attempt: (isRetry: boolean) => Promise<Response>,
  onResponse: (res: Response, isRetry: boolean) => Promise<T>,
  skipAuthRefresh?: boolean,
): Promise<T> {
  const first = await attempt(false);

  if (first.status !== 401) {
    return onResponse(first, false);
  }

  if (skipAuthRefresh === true) {
    const message = await parseErrorMessage(first);
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

  const second = await attempt(true);

  if (second.status === 401) {
    useAuthStore.getState().clearSession();
    redirectToLogin("unauthorized");
    throw {
      status: 401,
      message: "Unauthorized",
    } satisfies ApiError;
  }

  return onResponse(second, true);
}

function createAttempt(
  path: string,
  options: RequestOptions,
): (isRetry: boolean) => Promise<Response> {
  return (isRetry: boolean): Promise<Response> =>
    fetch(`${getBaseUrl()}${path}`, {
      method: options.method,
      headers: buildHeaders({ ...options, isRetry }),
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
}

async function request<T>(path: string, options: RequestOptions): Promise<T> {
  return executeWithAuthRetry(
    createAttempt(path, options),
    async (res: Response): Promise<T> => {
      if (!res.ok) {
        await throwForErrorResponse(res, path);
      }

      return (await res.json()) as T;
    },
    options.skipAuthRefresh,
  );
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
    const options: RequestOptions = {
      method: "POST",
      body,
      signal,
      isRetry: false,
    };

    return executeWithAuthRetry(
      createAttempt(path, options),
      async (res: Response): Promise<Response> => {
        if (!res.ok) {
          await throwForErrorResponse(res, path);
        }

        return res;
      },
    );
  },
};
