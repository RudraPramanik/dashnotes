import {
  isTokenExpiredOrExpiringSoon,
  refreshAccessToken,
} from "./token";
import { useAuthStore } from "@/lib/stores/auth-store";

let refreshPromise: Promise<boolean> | null = null;

function redirectToLogin(reason: string): void {
  if (typeof window !== "undefined") {
    window.location.assign(
      `/auth/login?reason=${encodeURIComponent(reason)}`,
    );
  }
}

export async function refreshIfNeeded(): Promise<boolean> {
  const { accessToken } = useAuthStore.getState();

  if (!accessToken) {
    return false;
  }

  if (!isTokenExpiredOrExpiringSoon(accessToken)) {
    return true;
  }

  if (refreshPromise !== null) {
    return refreshPromise;
  }

  refreshPromise = (async (): Promise<boolean> => {
    const store = useAuthStore.getState();
    const refreshToken = store.refreshToken;

    if (!refreshToken) {
      store.clearSession();
      redirectToLogin("session_expired");
      refreshPromise = null;
      return false;
    }

    try {
      const tokens = await refreshAccessToken(refreshToken);
      store.updateTokens(tokens);
      refreshPromise = null;
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (message === "REFRESH_EXPIRED") {
        store.clearSession();
        redirectToLogin("session_expired");
      }

      refreshPromise = null;
      return false;
    }
  })();

  return refreshPromise;
}

export async function handleUnauthorized(): Promise<boolean> {
  const store = useAuthStore.getState();
  const { refreshToken } = store;

  if (!refreshToken) {
    store.clearSession();
    redirectToLogin("session_expired");
    return false;
  }

  const refreshed = await refreshIfNeeded();

  if (!refreshed) {
    store.clearSession();
    redirectToLogin("session_expired");
    return false;
  }

  return true;
}
