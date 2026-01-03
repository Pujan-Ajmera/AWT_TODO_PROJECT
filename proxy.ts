import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const session = request.cookies.get('user_session');
    const { pathname } = request.nextUrl;

    // If user is logged in and tries to access login or register, redirect to dashboard
    if (session && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Protection logic: If user is not logged in and tries to access protected routes
    // We protect /tasks, /projects, and /admin
    if (!session && (pathname.startsWith('/tasks') || pathname.startsWith('/projects') || pathname.startsWith('/admin'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/login', '/register', '/', '/tasks/:path*', '/projects/:path*', '/admin/:path*'],
};
