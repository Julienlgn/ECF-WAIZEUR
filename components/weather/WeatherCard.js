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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{weather.name}</h2>
          <p className="text-gray-600">{formatDate(weather.dt)}</p>
          <p className="text-gray-500">{formatTime(weather.dt)}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center">
            <Image
              src={getWeatherIcon(weather.weather[0].icon)}
              alt={weather.weather[0].description}
              width={80}
              height={80}
              className="mr-4"
            />
            <div>
              <p className="text-4xl font-bold text-gray-800">
                {Math.round(weather.main.temp)}°C
              </p>
              <p className="text-gray-600 capitalize">
                {weather.weather[0].description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Image
              src="/images/icon_humidity.png"
              alt="Humidité"
              width={24}
              height={24}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-600">Humidité</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {weather.main.humidity}%
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
            <span className="text-sm font-medium text-gray-600">Vent</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {Math.round(weather.wind.speed)} km/h
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg
              className="w-6 h-6 mr-2 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600">Pression</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {weather.main.pressure} hPa
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg
              className="w-6 h-6 mr-2 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600">UV</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {weather.main.feels_like
              ? Math.round(weather.main.feels_like)
              : "N/A"}
            °C
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Température ressentie</p>
            <p className="text-lg font-semibold text-gray-800">
              {Math.round(weather.main.feels_like)}°C
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Min/Max</p>
            <p className="text-lg font-semibold text-gray-800">
              {Math.round(weather.main.temp_min)}°C /{" "}
              {Math.round(weather.main.temp_max)}°C
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
