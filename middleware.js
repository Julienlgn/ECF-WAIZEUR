import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Routes protégées qui nécessitent une authentification
  const protectedRoutes = ["/premium", "/dashboard"];

  // Vérifier si la route actuelle est protégée
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Pour l'instant, on laisse passer toutes les routes
    // La protection se fait côté client avec useAuth
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/premium/:path*", "/dashboard/:path*"],
};
