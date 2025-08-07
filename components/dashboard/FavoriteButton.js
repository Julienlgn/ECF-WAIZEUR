"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function FavoriteButton({
  city,
  weatherData,
  user,
  onFavoriteChange,
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && city) {
      checkIfFavorite();
    }
  }, [user, city]);

  const checkIfFavorite = async () => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("city", city)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erreur lors de la vérification des favoris:", error);
      } else {
        setIsFavorite(!!data);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des favoris:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert("Vous devez être connecté pour ajouter des favoris");
      return;
    }

    // Vérifier la limite de 3 favoris seulement pour les utilisateurs non-premium
    if (!isFavorite && !user.premium) {
      try {
        const { data: currentFavorites, error } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id);

        if (error) {
          console.error("Erreur lors de la vérification des favoris:", error);
        } else if (currentFavorites && currentFavorites.length >= 3) {
          alert(
            "Vous avez atteint la limite de 3 villes favorites. Passez à Premium pour ajouter autant de favoris que vous voulez !"
          );
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des favoris:", error);
      }
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Supprimer des favoris
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("city", city);

        if (error) {
          throw error;
        }

        setIsFavorite(false);
        console.log("Ville supprimée des favoris");

        // Notifier le parent du changement
        if (onFavoriteChange) {
          onFavoriteChange();
        }
      } else {
        // Ajouter aux favoris
        const favoriteData = {
          user_id: user.id,
          city: city,
          weather_data: weatherData,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("favorites")
          .insert([favoriteData]);

        if (error) {
          throw error;
        }

        setIsFavorite(true);
        console.log("Ville ajoutée aux favoris");

        // Notifier le parent du changement
        if (onFavoriteChange) {
          onFavoriteChange();
        }
      }
    } catch (error) {
      console.error("Erreur lors de la gestion des favoris:", error);

      // Gérer l'erreur spécifique de limite de favoris
      if (
        error.message &&
        error.message.includes("Limite de 3 favoris atteinte")
      ) {
        alert(
          "Vous avez atteint la limite de 3 villes favorites. Passez à Premium pour ajouter autant de favoris que vous voulez !"
        );
      } else {
        alert("Erreur lors de la gestion des favoris");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600 mb-3">
          Connectez-vous pour ajouter des villes à vos favoris
        </p>
        <a
          href="/auth/login"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Se connecter
        </a>
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
          isFavorite
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-blue-600 text-white hover:bg-blue-700"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {isFavorite ? "Suppression..." : "Ajout..."}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg
              className={`w-5 h-5 mr-2 ${
                isFavorite ? "text-white" : "text-white"
              }`}
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          </div>
        )}
      </button>

      {isFavorite && (
        <p className="text-sm text-green-600 mt-2">✓ Ajouté à vos favoris</p>
      )}
    </div>
  );
}
