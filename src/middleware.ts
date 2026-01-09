import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Current app version
const APP_VERSION = '2.0.0'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the first segment of the path
  const firstSegment = pathname.split('/')[1]
  
  // Check if first segment is a version number (e.g., /2.0.0, /1.0.0)
  const versionRegex = /^\d+\.\d+\.\d+$/
  if (firstSegment && versionRegex.test(firstSegment)) {
    // If it matches current version, redirect to home
    if (firstSegment === APP_VERSION) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('v', firstSegment)
      return NextResponse.redirect(url)
    }
    // If it's a different version, redirect to version mismatch page
    const url = request.nextUrl.clone()
    url.pathname = '/version'
    url.searchParams.set('requested', firstSegment)
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
