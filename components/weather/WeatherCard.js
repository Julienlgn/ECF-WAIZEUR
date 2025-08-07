"use client";

import Image from "next/image";

export default function WeatherCard({ weather, getWeatherIcon, user }) {
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
      {/* Image de fond */}
      <div className="absolute inset-0 z-0">
        <Image
          src={getWeatherIcon(weather.weather[0].icon)}
          alt={weather.weather[0].description}
          fill
          className="object-cover opacity-60"
        />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 p-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {weather.name}
              </h2>
              <p className="text-gray-600 font-semibold">
                {formatDate(weather.dt)}
              </p>
              <p className="text-gray-500 font-semibold">
                {formatTime(weather.dt)}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center">
                <div className="mr-4">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt={weather.weather[0].description}
                    width={80}
                    height={80}
                    className="drop-shadow-lg"
                  />
                </div>
                <div>
                  <p className="text-4xl font-bold text-gray-800">
                    {Math.round(weather.main.temp)}°C
                  </p>
                  <p className="text-gray-600 capitalize font-semibold">
                    {weather.weather[0].description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <img
                src="/images/icon_humidity.png"
                alt="Humidité"
                className="w-6 h-6"
              />
              <div>
                <p className="text-sm text-gray-500 font-semibold">Humidité</p>
                <p className="font-bold text-gray-800">
                  {weather.main.humidity}%
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <img src="/images/icon_wind.png" alt="Vent" className="w-6 h-6" />
              <div>
                <p className="text-sm text-gray-500 font-semibold">Vent</p>
                <p className="font-bold text-gray-800">
                  {Math.round(weather.wind.speed)} km/h
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-lg">🌡️</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Ressenti</p>
                <p className="font-bold text-gray-800">
                  {Math.round(weather.main.feels_like)}°C
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-lg">👁️</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">
                  Visibilité
                </p>
                <p className="font-bold text-gray-800">
                  {(weather.visibility / 1000).toFixed(1)} km
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
