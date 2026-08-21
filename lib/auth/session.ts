import { decodeJwt } from "jose";

import type { JwtClaims, UserRole } from "@/lib/stores/auth-store";

function isUserRole(value: string): value is UserRole {
  return value === "owner" || value === "admin" || value === "member";
}

export function claimsFromAccessToken(accessToken: string): JwtClaims {
  const payload = decodeJwt(accessToken);
  const sub = payload.sub;
  const wid = payload.wid;
  const role = payload.role;
  const exp = payload.exp;

  if (
    typeof sub !== "string" ||
    typeof wid !== "string" ||
    typeof role !== "string" ||
    !isUserRole(role) ||
    typeof exp !== "number"
  ) {
    throw new Error("Invalid token claims");
  }

  return { sub, wid, role, exp };
}

export function setPresenceCookie(): void {
  document.cookie = "dashnotes_authed=1; path=/";
}
