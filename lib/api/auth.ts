import { apiClient, isApiError } from "@/lib/api/client";
import { refreshAccessToken } from "@/lib/auth/token";

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
};

export type ForgotPasswordResponse = {
  message: string;
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

function toAuthRequestError(error: unknown): AuthRequestError {
  if (isAuthRequestError(error)) {
    return error;
  }
  if (isApiError(error)) {
    return {
      status: error.status,
      message: error.message,
      retryAfter: error.retryAfter,
    };
  }
  return {
    status: 0,
    message: "Request failed",
  };
}

async function throwIfAuthFailed(response: Response): Promise<void> {
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
}

async function parseAuthResponse(
  response: Response,
): Promise<TokenResponse> {
  await throwIfAuthFailed(response);
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

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<TokenResponse> {
  try {
    return await apiClient.post<TokenResponse>("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  } catch (error) {
    throw toAuthRequestError(error);
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<ForgotPasswordResponse> {
  const response = await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  await throwIfAuthFailed(response);
  return (await response.json()) as ForgotPasswordResponse;
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  if (response.status === 204) {
    return;
  }
  await throwIfAuthFailed(response);
}

export { isAuthRequestError };
