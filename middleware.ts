import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest, NextMiddleware } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
        "CATEGORY:WEBHOOK",
      ],
    }),
  ],
});

// ✅ this is your original logic
const existingMiddleware: NextMiddleware = async (req) => {
  const url = req.nextUrl;
  const auth = (req as any).kindeAuth || {};
  const user = auth.user;
  const token = auth.token;

  const orgCode =
    user?.org_code ||
    token?.org_code ||
    token?.claims?.org_code;

  if (
    url.pathname.startsWith("/workspace") &&
    orgCode &&
    !url.pathname.includes(orgCode)
  ) {
    url.pathname = `/workspace/${orgCode}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

// ✅ Wrap your middleware properly
const kindeMiddleware = withAuth(existingMiddleware, {
  publicPaths: ["/", "/api/uploadthing" ],
}) as NextMiddleware;

// ✅ Combine Kinde + Arcjet (do not invoke kindeMiddleware directly)
const composedMiddleware: NextMiddleware = createMiddleware(aj, kindeMiddleware);

export default composedMiddleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|healthz).*)"],
};
