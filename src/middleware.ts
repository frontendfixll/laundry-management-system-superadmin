import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Current app version
const APP_VERSION = '2.0.0'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the first and second segments of the path
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  const secondSegment = segments[1]
  
  // Check if first segment is a version number (e.g., /2.0.0, /1.0.0)
  const versionRegex = /^\d+\.\d+\.\d+$/
  if (firstSegment && versionRegex.test(firstSegment)) {
    // If version matches current version
    if (firstSegment === APP_VERSION) {
      // If there's a second segment (route), redirect to route with version param
      if (secondSegment) {
        const url = request.nextUrl.clone()
        url.pathname = `/${secondSegment}${segments.slice(2).length > 0 ? '/' + segments.slice(2).join('/') : ''}`
        url.searchParams.set('v', firstSegment)
        return NextResponse.redirect(url)
      }
      // Otherwise redirect to home with version param
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
