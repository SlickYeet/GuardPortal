import { getSessionCookie } from "better-auth/cookies"
import { NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = new URL(request.url)

  if (!sessionCookie && pathname.startsWith("/vpn")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (sessionCookie && pathname === "/") {
    return NextResponse.redirect(new URL("/vpn", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/vpn"],
}
