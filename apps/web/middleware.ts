import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { getUserMarket } from "@/lib/geo";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/invitations/(.*)",
  "/legal/(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (userId && req.nextUrl.pathname === "/") {
    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    injectMarketCookie(res, req);
    return res;
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  const res = NextResponse.next();
  injectMarketCookie(res, req);
  return res;
});

function injectMarketCookie(res: NextResponse, req: NextRequest) {
  if (req.cookies.has("tp_market")) return;
  const market = getUserMarket(req);
  res.cookies.set("tp_market", JSON.stringify(market), {
    path:     "/",
    maxAge:   60 * 60 * 24,
    sameSite: "lax",
    httpOnly: false,
  });
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
