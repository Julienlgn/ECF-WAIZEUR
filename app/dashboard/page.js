"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import SearchBar from "../../components/weather/SearchBar";
import WeatherCard from "../../components/weather/WeatherCard";
import ForecastList from "../../components/weather/ForecastList";
import FavoriteButton from "../../components/dashboard/FavoriteButton";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const [favorites, setFavorites] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const { user } = useAuth();

  const API_KEY = "d9ec316c2befc0f7909eccb409c4a7a1";

  // Charger les favoris de l'utilisateur
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des favoris:", error);
        return;
      }

      setFavorites(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des favoris:", error);
    }
  };

  const fetchWeatherData = async (city) => {
    setLoading(true);
    setError(null);

    try {
      // Données météo actuelles
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=fr`
      );

      if (!weatherResponse.ok) {
        throw new Error("Ville non trouvée");
      }

      const weather = await weatherResponse.json();

      // Prévisions sur 5 jours
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=fr`
      );

      if (!forecastResponse.ok) {
        throw new Error("Erreur lors de la récupération des prévisions");
      }

      const forecast = await forecastResponse.json();

      setWeatherData(weather);
      setForecastData(forecast);

      // Ajouter à l'historique
      setSearchHistory((prev) => {
        const newHistory = [
          city,
          ...prev.filter((item) => item !== city),
        ].slice(0, 5);
        return newHistory;
      });
    } catch (error) {
      setError(error.message);
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherCode) => {
    const iconMap = {
      "01d": "/images/sunny.png",
      "01n": "/images/sunny.png",
      "02d": "/images/cloudy.png",
      "02n": "/images/cloudy.png",
      "03d": "/images/cloudy.png",
      "03n": "/images/cloudy.png",
      "04d": "/images/cloudy.png",
      "04n": "/images/cloudy.png",
      "09d": "/images/rainy.png",
      "09n": "/images/rainy.png",
      "10d": "/images/rainy.png",
      "10n": "/images/rainy.png",
      "11d": "/images/storm.png",
      "11n": "/images/storm.png",
      "13d": "/images/snowy2.png",
      "13n": "/images/snowy2.png",
      "50d": "/images/foggy.png",
      "50n": "/images/foggy.png",
    };
    return iconMap[weatherCode] || "/images/sunny.png";
  };

  const removeFavorite = async (city) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("city", city);

      if (error) {
        throw error;
      }

      // Recharger les favoris
      await loadFavorites();
    } catch (error) {
      console.error("Erreur lors de la suppression du favori:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Dashboard WAIZEUR
          </h1>
          <p className="text-gray-600">
            Bienvenue {user?.firstName} ! Gérez vos villes favorites
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-8">
          <SearchBar onSearch={fetchWeatherData} />
        </div>

        {/* Historique de recherche */}
        {searchHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Recherches récentes
            </h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((city, index) => (
                <button
                  key={index}
                  onClick={() => fetchWeatherData(city)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Affichage des erreurs */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Villes favorites */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Vos villes favorites ({favorites.length}/3)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg shadow-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {favorite.city}
                    </h3>
                    <button
                      onClick={() => removeFavorite(favorite.city)}
                      className="text-red-500 hover:text-red-700"
                      title="Retirer des favoris"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Afficher les données météo si disponibles */}
                  {favorite.weather_data ? (
                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        <Image
                          src={getWeatherIcon(
                            favorite.weather_data.weather[0].icon
                          )}
                          alt={favorite.weather_data.weather[0].description}
                          width={60}
                          height={60}
                        />
                      </div>
                      <p className="text-2xl font-bold text-gray-800 mb-2">
                        {Math.round(favorite.weather_data.main.temp)}°C
                      </p>
                      <p className="text-gray-600 capitalize text-sm">
                        {favorite.weather_data.weather[0].description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">
                      Données météo non disponibles
                    </p>
                  )}

                  <button
                    onClick={() => fetchWeatherData(favorite.city)}
                    className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Voir les détails
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message si pas de favoris */}
        {favorites.length === 0 && !weatherData && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Image
                src="/globe.svg"
                alt="Globe"
                width={120}
                height={120}
                className="mx-auto mb-6 opacity-60"
              />
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Aucune ville favorite
              </h2>
              <p className="text-gray-600 mb-6">
                Recherchez une ville et ajoutez-la à vos favoris pour la
                retrouver ici. Vous pouvez ajouter jusqu'à 3 villes favorites.
              </p>
            </div>
          </div>
        )}

        {/* Données météo de recherche */}
        {weatherData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Carte météo principale */}
            <div className="lg:col-span-2">
              <WeatherCard
                weather={weatherData}
                getWeatherIcon={getWeatherIcon}
                user={user}
              />
            </div>

            {/* Bouton favori */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Actions
                </h3>
                <FavoriteButton
                  city={weatherData.name}
                  weatherData={weatherData}
                  user={user}
                  onFavoriteChange={loadFavorites}
                />
                {favorites.length >= 3 && (
                  <p className="text-sm text-orange-600 mt-2">
                    ⚠️ Vous avez atteint la limite de 3 favoris
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prévisions */}
        {forecastData && !loading && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Prévisions sur 5 jours
            </h2>
            <ForecastList
              forecast={forecastData}
              getWeatherIcon={getWeatherIcon}
            />
          </div>
        )}
      </div>
    </div>
  );
}
