import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Vérifier côté client
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("userData");

      if (!token || !userData) {
        console.log("Pas d'authentification, redirection vers login");
        router.push("/auth/login");
        return;
      }

      // Vérification basique du token
      try {
        const parsedUserData = JSON.parse(userData);
        console.log("Utilisateur authentifié:", parsedUserData);

        // Récupérer les données fraîches depuis Supabase
        const { data: freshUserData, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", parsedUserData.id)
          .single();

        if (error) {
          console.error(
            "Erreur lors de la récupération des données fraîches:",
            error
          );
          // Utiliser les données localStorage en fallback
          setUser(parsedUserData);
          setIsPremium(parsedUserData.premium || false);
        } else {
          console.log("Données fraîches récupérées:", freshUserData);
          setUser(freshUserData);
          setIsPremium(freshUserData.premium || false);

          // Mettre à jour localStorage avec les données fraîches
          localStorage.setItem("userData", JSON.stringify(freshUserData));
        }
      } catch (error) {
        console.error("Erreur lors du parsing des données utilisateur:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        router.push("/auth/login");
        return;
      }
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
    setIsPremium(false);
    router.push("/");
  };

  const updateUserPremiumStatus = (isPremium) => {
    setIsPremium(isPremium);
    if (user) {
      const updatedUser = { ...user, premium: isPremium };
      setUser(updatedUser);
      // Mettre à jour localStorage
      localStorage.setItem("userData", JSON.stringify(updatedUser));
    }
  };

  return {
    user,
    loading,
    isPremium,
    logout,
    updateUserPremiumStatus,
    checkAuthStatus,
  };
};
