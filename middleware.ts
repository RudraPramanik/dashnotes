import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/auth/")) {
    return true;
  }
  if (pathname.startsWith("/api/")) {
    return true;
  }
  return false;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.get("dashnotes_authed")?.value;

  if (pathname === "/") {
    if (authed) {
      return NextResponse.redirect(new URL("/notes", request.url));
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (authed && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/notes", request.url));
  }

  if (!authed && !isPublicPath(pathname)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("reason", "unauthenticated");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
