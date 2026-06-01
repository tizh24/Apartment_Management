import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_HOME_PATH: Record<string, string> = {
    admin: '/admin',
    staff: '/staff',
    sale: '/sale',
    customer: '/guest-portal',
};

const ROLE_PREFIX: Record<string, string> = {
    admin: '/admin',
    staff: '/staff',
    sale: '/sale',
    customer: '/guest-portal',
};

function getRequiredRole(pathname: string): string | null {
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/staff')) return 'staff';
    if (pathname.startsWith('/sale')) return 'sale';
    if (pathname.startsWith('/guest-portal')) return 'customer';
    return null;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    const role = request.cookies.get('demo_role')?.value;
    const requiredRole = getRequiredRole(pathname);

    if (pathname === '/' && role && ROLE_HOME_PATH[role]) {
        return NextResponse.redirect(new URL(ROLE_HOME_PATH[role], request.url));
    }

    if (requiredRole && (!role || role !== requiredRole)) {
        if (role && ROLE_PREFIX[role]) {
            return NextResponse.redirect(new URL(ROLE_PREFIX[role], request.url));
        }

        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
