// src/middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAppRoute = req.nextUrl.pathname.startsWith("/app");
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");
  const isProtectedRoute = isAdminRoute || isAppRoute || isDashboardRoute;
  
  // Check for token in the Authorization header or cookies
  const token = req.cookies.get("access_token")?.value;
  const isLoggedIn = !!token;
  
  console.log(
    "Middleware -",
    "Path:", req.nextUrl.pathname,
    "Token exists:", isLoggedIn
  );

  // Allow direct access to login page
  if (isLoginPage) {
    return NextResponse.next();
  }
  
  // If user is not logged in and tries to access protected routes
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
  
  // For all other routes, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*", "/auth/:path*", "/admin/:path*"],
};
