import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to redirect root "/" to "/suppliers"
 * This ensures the app always opens to the suppliers register
 */
export function middleware(request: NextRequest) {
  // If accessing root path, redirect to /suppliers
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/suppliers', request.url))
  }

  return NextResponse.next()
}

// Configure middleware to run on root path
export const config = {
  matcher: '/',
}
