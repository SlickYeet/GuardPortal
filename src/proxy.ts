import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/server/auth"

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const { pathname } = new URL(request.url)

  if (!session && pathname.startsWith("/vpn")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/vpn", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/vpn"],
}
