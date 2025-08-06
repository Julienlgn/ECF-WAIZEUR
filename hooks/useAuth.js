"use client";
import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        // Vérification côté client
        if (typeof window === "undefined") {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("userData");

        console.log("=== useAuth Hook ===");
        console.log("Token:", token ? "Présent" : "Absent");
        console.log("UserData:", userData ? "Présent" : "Absent");

        if (!token || !userData) {
          console.log("Pas de token ou userData, utilisateur non connecté");
          setUser(null);
          setLoading(false);
          return;
        }

        // Vérification temporaire sans API
        try {
          const parsedUserData = JSON.parse(userData);
          console.log("Utilisateur parsé:", parsedUserData);
          setUser(parsedUserData);
        } catch (error) {
          console.error(
            "Erreur lors du parsing des données utilisateur:",
            error
          );
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          setUser(null);
        }
      } catch (error) {
        console.error("Erreur d'authentification:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateAuth();
  }, []);

  const signOut = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      setUser(null);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isPremium: user?.premium || false,
  };
}
