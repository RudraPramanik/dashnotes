import { decodeJwt } from "jose";
import { create } from "zustand";

export type UserRole = "owner" | "admin" | "member";
export type TokenPair = { accessToken: string; refreshToken: string };
export type JwtClaims = { sub: string; wid: string; role: UserRole; exp: number };

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  workspaceId: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  setSession: (tokens: TokenPair, claims: JwtClaims) => void;
  updateTokens: (tokens: TokenPair) => void;
  clearSession: () => void;
};

const ACCESS_TOKEN_KEY = "dashnotes_at";
const PRESENCE_COOKIE_CLEAR =
  "dashnotes_authed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

const EMPTY_SESSION = {
  accessToken: null,
  refreshToken: null,
  userId: null,
  workspaceId: null,
  role: null,
  isAuthenticated: false,
} as const;

function isUserRole(value: string): value is UserRole {
  return value === "owner" || value === "admin" || value === "member";
}

function parseClaimsFromToken(token: string): {
  userId: string;
  workspaceId: string;
  role: UserRole;
} | null {
  try {
    const payload = decodeJwt(token);
    const sub = payload.sub;
    const wid = payload.wid;
    const role = payload.role;

    if (
      typeof sub !== "string" ||
      typeof wid !== "string" ||
      typeof role !== "string" ||
      !isUserRole(role)
    ) {
      return null;
    }

    return {
      userId: sub,
      workspaceId: wid,
      role,
    };
  } catch {
    return null;
  }
}

function persistAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

function removePersistedSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    document.cookie = PRESENCE_COOKIE_CLEAR;
  }
}

function hydrateFromSessionStorage(): Pick<
  AuthState,
  | "accessToken"
  | "refreshToken"
  | "userId"
  | "workspaceId"
  | "role"
  | "isAuthenticated"
> {
  if (typeof window === "undefined") {
    return { ...EMPTY_SESSION };
  }

  const storedToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (!storedToken) {
    return { ...EMPTY_SESSION };
  }

  const claims = parseClaimsFromToken(storedToken);
  if (!claims) {
    return { ...EMPTY_SESSION };
  }

  return {
    accessToken: storedToken,
    refreshToken: null,
    userId: claims.userId,
    workspaceId: claims.workspaceId,
    role: claims.role,
    isAuthenticated: storedToken !== null,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  ...hydrateFromSessionStorage(),

  setSession: (tokens, claims) => {
    persistAccessToken(tokens.accessToken);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: claims.sub,
      workspaceId: claims.wid,
      role: claims.role,
      isAuthenticated: tokens.accessToken !== null,
    });
  },

  updateTokens: (tokens) => {
    persistAccessToken(tokens.accessToken);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: tokens.accessToken !== null,
    });
  },

  clearSession: () => {
    removePersistedSession();
    set({ ...EMPTY_SESSION });
  },
}));
