import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: the backend validates the token on every admin API call.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("testr_admin");
  const isLogin = request.nextUrl.pathname === "/admin/login";
  if (!hasSession && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (hasSession && isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
