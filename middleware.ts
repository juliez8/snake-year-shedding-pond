/**
 * Global middleware for basic API hardening.
 * Enforces a max content-length and restricts allowed HTTP methods on /api routes.
 */
import { NextRequest, NextResponse } from 'next/server';
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Block requests with suspiciously large content-length on API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
      return NextResponse.json(
        { error: 'Request entity too large.' },
        { status: 413 }
      );
    }

    // Only allow expected HTTP methods on API routes
    const method = request.method.toUpperCase();
    if (!['GET', 'POST', 'OPTIONS', 'HEAD'].includes(method)) {
      return NextResponse.json(
        { error: 'Method not allowed.' },
        { status: 405 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
