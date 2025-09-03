import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/courses',
  '/assignments',
  '/api/classroom',
  '/api/assignments',
  '/api/user/status',
];

const authRoutes = [
  '/sign-in',
  '/sign-up',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const sessionCookie = request.cookies.getAll().find(cookie => 
    cookie.name.startsWith('better-auth.session')
  );
  const sessionToken = sessionCookie?.value;
  
  if (isProtectedRoute && !sessionToken) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  if (isProtectedRoute && sessionToken && request.nextUrl.searchParams.has('redirect')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

