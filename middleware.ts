import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function middleware(req: NextRequest) {
    try {
        const { getClaim } = getKindeServerSession();
        const orgCode = await getClaim("org_code");
        const url = req.nextUrl.clone();

        // Workspace redirect logic
        if (
            url.pathname.startsWith("/workspace") &&
            orgCode?.value &&
            !url.pathname.includes(orgCode.value)
        ) {
            url.pathname = `/workspace/${orgCode.value}`;
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    } catch (error) {
        console.error("Middleware error:", error);
        return NextResponse.next();
    }
}

export default middleware;

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|/rpc|api/auth).*)",
    ],
};