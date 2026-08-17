import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Next.js 16 renamed the `middleware` file convention to `proxy`. Clerk's
// handler is still a standard Next middleware function under the hood, so
// it's simply re-exported here as `proxy`.
const isPublicRoute = createRouteMatcher([
  "/",
  "/onboarding(.*)",
  "/inscription(.*)",
  "/connexion(.*)",
  "/api/track",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
  "/ressources(.*)",
  "/confidentialite",
  "/avis",
  "/r/(.*)",
  "/carte/(.*)", // carte joueur partagée publiquement
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/api/(.*)"],
};
