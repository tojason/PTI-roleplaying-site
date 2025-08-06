import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // For development - minimal middleware that allows all routes
  // This bypasses authentication for easier development testing
  
  // Log the route access
  console.log(`[Middleware] Accessing: ${pathname}`);
  
  // Allow all routes in development
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Student routes
    '/dashboard/:path*',
    '/practice/:path*',
    '/progress/:path*',
    '/profile/:path*',
    // Instructor routes
    '/instructor/:path*',
    // Admin routes
    '/admin/:path*',
  ],
};