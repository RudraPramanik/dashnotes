import { decodeJwt } from "jose";

type TokenPair = { accessToken: string; refreshToken: string };

type RefreshTokenResponse = {
  access_token: string;
  refresh_token: string;
};

export function getTokenExpiry(token: string): number {
  try {
    const claims = decodeJwt(token);
    const exp = claims.exp;
    return typeof exp === "number" ? exp : 0;
  } catch {
    return 0;
  }
}

export function isTokenExpiredOrExpiringSoon(
  token: string,
  bufferSeconds = 60,
): boolean {
  const exp = getTokenExpiry(token);
  if (exp === 0) {
    return true;
  }

  return exp - Math.floor(Date.now() / 1000) < bufferSeconds;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenPair> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("REFRESH_FAILED");
  }

  const response = await fetch(`${apiUrl}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (response.status === 401) {
    throw new Error("REFRESH_EXPIRED");
  }

  if (response.status === 429) {
    throw new Error("REFRESH_RATE_LIMITED");
  }

  if (!response.ok) {
    throw new Error("REFRESH_FAILED");
  }

  const data = (await response.json()) as RefreshTokenResponse;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}
