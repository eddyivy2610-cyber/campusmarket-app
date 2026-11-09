import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Rewrite /@username -> /profile/username (preserving query parameters)
  if (pathname.startsWith("/@")) {
    const rawUsername = pathname.slice(2);
    const cleanUsername = decodeURIComponent(rawUsername).replace(/\/+$/, "").trim();
    if (cleanUsername) {
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = `/profile/${cleanUsername}`;
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  // 2. Canonical 308 Redirect for /stores/[slug] -> /store/[slug] (exclude exact /stores listing page)
  if (pathname.startsWith("/stores/") && pathname !== "/stores/") {
    const slug = pathname.slice("/stores/".length).replace(/\/+$/, "");
    if (slug) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = `/store/${slug}`;
      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  // 3. Canonical 308 Redirect for /listings/[id] -> /listing/[id] (exclude /listings/create)
  if (pathname.startsWith("/listings/") && !pathname.startsWith("/listings/create")) {
    const id = pathname.slice("/listings/".length).replace(/\/+$/, "");
    if (id) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = `/listing/${id}`;
      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/@:username*",
    "/stores/:slug+",
    "/listings/:id+",
  ],
};
