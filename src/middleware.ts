// src/middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAppRoute = req.nextUrl.pathname.startsWith("/app");
  const userRole = req.auth?.user?.role;

  console.log(
    "Middleware - User Role:",
    userRole,
    "Path:",
    req.nextUrl.pathname
  );

  // If user is logged in and tries to access auth pages, redirect based on role
  if (isLoggedIn && isAuthPage) {
    const redirectUrl = userRole === "admin" ? "/admin" : "/app";
    console.log("Redirecting from auth to:", redirectUrl);
    return NextResponse.redirect(new URL(redirectUrl, req.nextUrl.origin));
  }

  // If user is not logged in and tries to access protected routes
  if (!isLoggedIn && (isAdminRoute || isAppRoute)) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    console.log("Redirecting to login, callback:", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If admin tries to access /app, redirect to /admin
  if (isLoggedIn && isAppRoute && userRole === "admin") {
    console.log("Admin accessing /app, redirecting to /admin");
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  // Check if non-admin tries to access admin routes
  if (isLoggedIn && isAdminRoute && userRole !== "admin") {
    console.log("Non-admin trying to access admin route, redirecting to /app");
    return NextResponse.redirect(new URL("/app", req.nextUrl.origin));
  }

  console.log("Allowing access to:", req.nextUrl.pathname);
  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*", "/auth/:path*", "/admin/:path*"],
};
