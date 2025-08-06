"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function FavoriteList({ userId }) {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Charger les favoris
  useEffect(() => {
    const loadFavorites = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setFavorites(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des favoris:", error);
        setError("Erreur lors du chargement des favoris");
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [userId]);

  const removeFavorite = async (city) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("city", city);

      if (error) throw error;

      // Mettre à jour la liste locale
      setFavorites(favorites.filter((fav) => fav.city !== city));
    } catch (error) {
      console.error("Erreur lors de la suppression du favori:", error);
      alert("Erreur lors de la suppression du favori");
    }
  };

  if (!userId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800">
          Vous devez être connecté pour voir vos favoris.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
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
        <span className="ml-2 text-gray-600">Chargement des favoris...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun favori</h3>
        <p className="mt-1 text-sm text-gray-500">
          Vous n'avez pas encore ajouté de villes en favoris.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Vos villes favorites ({favorites.length})
      </h3>
      <div className="grid gap-4">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-gray-900">{favorite.city}</span>
              <span className="text-sm text-gray-500">
                ajouté le{" "}
                {new Date(favorite.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <button
              onClick={() => removeFavorite(favorite.city)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
