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

  // Charger les favoris de l'utilisateur et mettre à jour leurs données météo
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  // Mettre à jour les données météo des favoris au chargement
  useEffect(() => {
    if (favorites.length > 0) {
      updateFavoritesWeatherData();
    }
  }, [favorites]);

  const updateFavoritesWeatherData = async () => {
    for (const favorite of favorites) {
      // Vérifier si les données météo sont récentes (moins de 30 minutes)
      const lastUpdate = favorite.weather_data?.dt;
      const now = Math.floor(Date.now() / 1000);
      const thirtyMinutes = 30 * 60;

      if (!lastUpdate || now - lastUpdate > thirtyMinutes) {
        try {
          console.log("Mise à jour des données météo pour:", favorite.city);

          let weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
              favorite.city
            )}&appid=${API_KEY}&units=metric&lang=fr`
          );

          if (!weatherResponse.ok) {
            weatherResponse = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                favorite.city
              )}, France&appid=${API_KEY}&units=metric&lang=fr`
            );
          }

          if (weatherResponse.ok) {
            const weather = await weatherResponse.json();
            await updateFavoriteWeatherData(favorite.city, weather);
          }
        } catch (error) {
          console.error(
            "Erreur lors de la mise à jour des données météo pour:",
            favorite.city,
            error
          );
        }
      }
    }
  };

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
      // Extraire le nom de la ville si le format est "Ville, CodePostal"
      const cityName = city.includes(",") ? city.split(",")[0].trim() : city;

      console.log("Recherche météo pour:", cityName);

      // Essayer d'abord avec le nom de la ville seul
      let weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          cityName
        )}&appid=${API_KEY}&units=metric&lang=fr`
      );

      // Si ça ne marche pas, essayer avec ", France"
      if (!weatherResponse.ok) {
        console.log("Première tentative échouée, essai avec France");
        weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            cityName
          )}, France&appid=${API_KEY}&units=metric&lang=fr`
        );
      }

      if (!weatherResponse.ok) {
        throw new Error(
          `Ville "${cityName}" non trouvée. Essayez avec un nom plus complet.`
        );
      }

      const weather = await weatherResponse.json();
      console.log("Données météo récupérées:", weather);

      // Prévisions sur 5 jours - utiliser la même approche
      let forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          cityName
        )}&appid=${API_KEY}&units=metric&lang=fr`
      );

      if (!forecastResponse.ok) {
        forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
            cityName
          )}, France&appid=${API_KEY}&units=metric&lang=fr`
        );
      }

      if (!forecastResponse.ok) {
        throw new Error("Erreur lors de la récupération des prévisions");
      }

      const forecast = await forecastResponse.json();

      setWeatherData(weather);
      setForecastData(forecast);

      // Mettre à jour les données météo des favoris si cette ville est dans les favoris
      if (user) {
        updateFavoriteWeatherData(cityName, weather);
      }

      // Ajouter à l'historique avec le nom de la ville uniquement
      setSearchHistory((prev) => {
        const newHistory = [
          cityName,
          ...prev.filter((item) => item !== cityName),
        ].slice(0, 5);
        return newHistory;
      });
    } catch (error) {
      console.error("Erreur météo:", error);
      setError(error.message);
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  const updateFavoriteWeatherData = async (cityName, weatherData) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .update({ weather_data: weatherData })
        .eq("user_id", user.id)
        .eq("city", cityName);

      if (error) {
        console.error(
          "Erreur lors de la mise à jour des données météo:",
          error
        );
      } else {
        console.log("Données météo mises à jour pour:", cityName);
        // Recharger les favoris pour afficher les nouvelles données
        await loadFavorites();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des données météo:", error);
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

  const formatLastUpdate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">WAIZEUR</h1>
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

        {/* Données météo de recherche */}
        {weatherData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                {favorites.length >= 3 && !user?.premium && (
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Prévisions sur 5 jours
            </h2>
            <ForecastList
              forecast={forecastData}
              getWeatherIcon={getWeatherIcon}
            />
          </div>
        )}

        {/* Villes favorites */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Vos villes favorites ({favorites.length}
              {!user?.premium ? "/3" : ""})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden relative"
                >
                  {/* Image de fond */}
                  {favorite.weather_data && (
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={getWeatherIcon(
                          favorite.weather_data.weather[0].icon
                        )}
                        alt={favorite.weather_data.weather[0].description}
                        fill
                        className="object-cover opacity-60"
                      />
                    </div>
                  )}

                  {/* Contenu principal */}
                  <div className="relative z-10 p-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {favorite.city}
                          </h3>
                          {favorite.weather_data && (
                            <div className="flex items-center space-x-2 mt-1">
                              <img
                                src={`https://openweathermap.org/img/wn/${favorite.weather_data.weather[0].icon}@2x.png`}
                                alt={
                                  favorite.weather_data.weather[0].description
                                }
                                width={40}
                                height={40}
                                className="drop-shadow-lg"
                              />
                              <div>
                                <p className="text-lg font-bold text-gray-800">
                                  {Math.round(favorite.weather_data.main.temp)}
                                  °C
                                </p>
                                <p className="text-sm text-gray-600 capitalize font-semibold">
                                  {favorite.weather_data.weather[0].description}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeFavorite(favorite.city)}
                          className="text-red-500 hover:text-red-700 transition-colors"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      {favorite.weather_data && (
                        <div className="text-xs text-gray-500 font-semibold">
                          <p>
                            Dernière mise à jour :{" "}
                            {formatLastUpdate(favorite.weather_data.dt)}
                          </p>
                        </div>
                      )}

                      {!favorite.weather_data && (
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-2 font-semibold">
                            Aucune donnée météo disponible
                          </p>
                          <button
                            onClick={() =>
                              updateFavoriteWeatherData(favorite.city)
                            }
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors font-semibold"
                          >
                            Actualiser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
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
                retrouver ici.{" "}
                {!user?.premium
                  ? "Vous pouvez ajouter jusqu'à 3 villes favorites."
                  : "Vous pouvez ajouter autant de favoris que vous voulez avec votre compte Premium !"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
