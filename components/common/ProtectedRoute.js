"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log("=== ProtectedRoute Check ===");

        // Vérifier côté client
        if (typeof window === "undefined") {
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("userData");

        console.log("Token:", token ? "Présent" : "Absent");
        console.log("UserData:", userData ? "Présent" : "Absent");

        if (!token || !userData) {
          console.log("Pas d'authentification, redirection vers login");
          router.push("/auth/login");
          return;
        }

        // Vérification basique du token (optionnel)
        try {
          const parsedUserData = JSON.parse(userData);
          console.log("Utilisateur authentifié:", parsedUserData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error(
            "Erreur lors du parsing des données utilisateur:",
            error
          );
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          router.push("/auth/login");
          return;
        }
      } catch (error) {
        console.error("Erreur d'authentification:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg font-medium text-gray-700">
            Vérification de l'authentification...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // La redirection est gérée dans useEffect
  }

  return children;
}
