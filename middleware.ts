import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api"],
  debug: process.env.NODE_ENV === "development",
  afterAuth(auth, req, evt) {
    if (!auth.userId && !auth.isPublicRoute)
      return new Response("Unauthorized", { status: 401 });
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
