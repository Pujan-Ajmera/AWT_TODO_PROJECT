import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('user_session');
    const { pathname } = request.nextUrl;

    // If user is logged in and tries to access login/register, redirect to dashboard
    if (session && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    // If user is not logged in and tries to access protected routes, redirect to login
    // Note: Add other protected routes to this condition as needed
    if (!session && (pathname.startsWith('/home') || pathname.startsWith('/tasks') || pathname.startsWith('/projects'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/login', '/register', '/home/:path*', '/tasks/:path*', '/projects/:path*'],
};
