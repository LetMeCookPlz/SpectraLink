import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "plans", "/api/signup", "/api/plans", "public/images/background.jpg"];
const ADMIN_ROUTES = ["/admin", "/api/admin"];

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req });

  if (PUBLIC_ROUTES.includes(path)) {
    return NextResponse.next();
  }

  if (ADMIN_ROUTES.some(route => path.startsWith(route))) {
    if (!token || token.user_type !== "Admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};