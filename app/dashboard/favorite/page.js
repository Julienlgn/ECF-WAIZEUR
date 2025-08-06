"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

// Composant FavoriteList intégré directement
function FavoriteList({ userId }) {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [weatherData, setWeatherData] = useState({});

  // Clé API pour accéder au service OpenWeatherMap
  const API_KEY = "d9ec316c2befc0f7909eccb409c4a7a1";

  // Fonction pour récupérer la météo d'une ville
  const getWeatherForCity = async (cityName) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=fr`
      );
      if (!response.ok) throw new Error("Météo non trouvée");
      const data = await response.json();
      return {
        temperature: `${Math.round(data.main.temp)}°C`,
        description: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon.replace(
          "n",
          "d"
        )}.png`,
      };
    } catch (error) {
      console.error(`Erreur météo pour ${cityName}:`, error);
      return null;
    }
  };

  // Charger les favoris et leur météo
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

        // Récupérer la météo pour chaque ville favorite
        const weatherPromises = (data || []).map(async (favorite) => {
          const weather = await getWeatherForCity(favorite.city);
          return { city: favorite.city, weather };
        });

        const weatherResults = await Promise.all(weatherPromises);
        const weatherMap = {};
        weatherResults.forEach((result) => {
          if (result.weather) {
            weatherMap[result.city] = result.weather;
          }
        });
        setWeatherData(weatherMap);
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
      // Supprimer les données météo de cette ville
      const newWeatherData = { ...weatherData };
      delete newWeatherData[city];
      setWeatherData(newWeatherData);
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
        {favorites.map((favorite) => {
          const weather = weatherData[favorite.city];
          return (
            <div
              key={favorite.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-col space-y-2">
                <div className="flex items-center space-x-2">
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
                  <span className="font-medium text-gray-900">
                    {favorite.city}
                  </span>
                </div>
                {weather && (
                  <div className="flex items-center space-x-2 ml-7">
                    <img
                      src={weather.icon}
                      alt="weather icon"
                      className="h-6 w-6"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {weather.temperature}
                    </span>
                    <span className="text-xs text-gray-500">
                      {weather.description}
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-500 ml-7">
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
          );
        })}
      </div>
    </div>
  );
}

export default function FavoritePage() {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'ID utilisateur depuis localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user.id);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
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
          <span className="ml-2 text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Favoris</h2>

      {!userId ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            Vous devez être connecté pour accéder à vos favoris.
          </p>
        </div>
      ) : (
        <FavoriteList userId={userId} />
      )}
    </div>
  );
}
