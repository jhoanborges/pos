// src/middleware.ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth(req => {
    const isLoginPage = req.nextUrl.pathname === '/login'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isAppRoute = req.nextUrl.pathname.startsWith('/app')
    const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard')
    const isProtectedRoute = isAdminRoute || isAppRoute || isDashboardRoute

    const isLoggedIn = !!req.auth?.user

    // If user is logged in and tries to access login page, redirect to app
    if (isLoggedIn && isLoginPage) {
        return NextResponse.redirect(new URL('/app', req.nextUrl.origin))
    }

    // Allow direct access to login page when not logged in
    if (isLoginPage) {
        return NextResponse.next()
    }

    // If user is not logged in and tries to access protected routes
    if (!isLoggedIn && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', req.nextUrl.origin))
    }

    // For all other routes, proceed normally
    return NextResponse.next()
})

export const config = {
    matcher: [
        '/app/:path*',
        '/dashboard/:path*',
        '/auth/:path*',
        '/admin/:path*',
        '/login',
    ],
}
