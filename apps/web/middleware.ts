import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isAuthPage = createRouteMatcher(["/sign-in", "/sign-up"]);
const isProtectedRoute = createRouteMatcher(["/app(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Redirect authenticated users away from auth pages to /app
  if (isAuthPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/app");
  }
  // Redirect unauthenticated users from protected routes to /sign-in
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
