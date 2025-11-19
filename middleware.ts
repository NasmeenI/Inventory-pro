import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the path starts with /dashboard
  if (pathname.startsWith('/dashboard')) {
    // Get token from cookie or you can check localStorage on client side
    const token = request.cookies.get('token')?.value
    
    // For now, we'll let client-side handle auth redirect
    // since we're using localStorage for token storage
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
