"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = "d9ec316c2befc0f7909eccb409c4a7a1";
  const DEFAULT_CITY = "Paris"; // Ville par défaut

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${DEFAULT_CITY}&appid=${API_KEY}&units=metric&lang=fr`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données météo");
      }

      const weather = await response.json();
      setWeatherData(weather);
    } catch (error) {
      setError(error.message);
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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">WAIZEUR</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/auth/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Météo en temps réel
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Consultez la météo actuelle de {DEFAULT_CITY}
          </p>
          <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🚀 Fonctionnalités Premium
            </h3>
            <p className="text-blue-700">
              Créez un compte pour accéder à vos villes favorites, aux
              prévisions sur 5 jours et plus encore !
            </p>
          </div>
        </div>

        {/* Weather Card */}
        <div className="max-w-2xl mx-auto">
          {loading && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de la météo...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {weatherData && !loading && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {weatherData.name}
                  </h3>
                  <p className="text-gray-600">{formatDate(weatherData.dt)}</p>
                  <p className="text-gray-500">{formatTime(weatherData.dt)}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <Image
                      src={getWeatherIcon(weatherData.weather[0].icon)}
                      alt={weatherData.weather[0].description}
                      width={80}
                      height={80}
                      className="mr-4"
                    />
                    <div>
                      <p className="text-4xl font-bold text-gray-800">
                        {Math.round(weatherData.main.temp)}°C
                      </p>
                      <p className="text-gray-600 capitalize">
                        {weatherData.weather[0].description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Image
                      src="/images/icon_humidity.png"
                      alt="Humidité"
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-600">
                      Humidité
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {weatherData.main.humidity}%
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Image
                      src="/images/icon_wind.png"
                      alt="Vent"
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-600">
                      Vent
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.round(weatherData.wind.speed)} km/h
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Température ressentie
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {Math.round(weatherData.main.feels_like)}°C
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Min/Max</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {Math.round(weatherData.main.temp_min)}°C /{" "}
                      {Math.round(weatherData.main.temp_max)}°C
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Rejoignez WAIZEUR
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre compte pour accéder à toutes les fonctionnalités :
            </p>
            <ul className="text-left text-gray-600 mb-6 space-y-2">
              <li>• ✅ Jusqu'à 3 villes favorites</li>
              <li>• ✅ Prévisions météo sur 5 jours</li>
              <li>• ✅ Historique de vos recherches</li>
              <li>• ✅ Interface personnalisée</li>
            </ul>
            <div className="flex justify-center space-x-4">
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Créer un compte
              </Link>
              <Link
                href="/auth/login"
                className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors font-medium"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
