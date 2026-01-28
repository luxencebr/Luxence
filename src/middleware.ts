import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Continue with the request without analytics tracking
  const response = NextResponse.next();

  // Set session cookie if it doesn't exist
  const shouldTrack =
    !request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.startsWith("/_next") &&
    !request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.includes("favicon");

  if (shouldTrack && !request.cookies.get("session-id")) {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    response.cookies.set("session-id", sessionId, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: false, // Allow JavaScript access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
