export { auth as middleware } from "@/auth";
export const config = { matcher: ["/order/:path*", "/cart/:path*", "/profile/:path*", "/success/:path*"] };
