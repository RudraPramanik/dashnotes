import { refreshAccessToken } from "@/lib/auth/token";

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
};

export type AuthRequestError = {
  status: number;
  message: string;
  retryAfter?: number;
};

function getApiBaseUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw {
      status: 0,
      message: "API URL not configured",
    } satisfies AuthRequestError;
  }
  return apiUrl;
}

function isAuthRequestError(error: unknown): error is AuthRequestError {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  return "status" in error && "message" in error;
}

async function parseAuthResponse(
  response: Response,
): Promise<TokenResponse> {
  if (response.status === 429) {
    const retryAfterHeader = response.headers.get("Retry-After");
    const parsedRetryAfter = retryAfterHeader
      ? Number.parseInt(retryAfterHeader, 10)
      : undefined;
    throw {
      status: 429,
      message: "Too many requests",
      retryAfter:
        parsedRetryAfter !== undefined && !Number.isNaN(parsedRetryAfter)
          ? parsedRetryAfter
          : undefined,
    } satisfies AuthRequestError;
  }

  if (!response.ok) {
    let message = response.statusText || "Request failed";
    try {
      const data = (await response.json()) as {
        detail?: string;
        message?: string;
      };
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (typeof data.message === "string") {
        message = data.message;
      }
    } catch {
      // body is not JSON
    }
    throw {
      status: response.status,
      message,
    } satisfies AuthRequestError;
  }

  return (await response.json()) as TokenResponse;
}

export async function login(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseAuthResponse(response);
}

export async function register(
  email: string,
  password: string,
  workspaceName?: string,
): Promise<TokenResponse> {
  const body: { email: string; password: string; workspace_name?: string } = {
    email,
    password,
  };
  if (workspaceName !== undefined && workspaceName.length > 0) {
    body.workspace_name = workspaceName;
  }

  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseAuthResponse(response);
}

export async function refresh(
  refreshToken: string,
): Promise<TokenResponse> {
  const tokens = await refreshAccessToken(refreshToken);
  return {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  };
}

export { isAuthRequestError };
