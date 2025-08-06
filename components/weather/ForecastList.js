"use client";

import Image from "next/image";

export default function ForecastList({ forecast, getWeatherIcon }) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Grouper les prévisions par jour
  const dailyForecasts = forecast.list.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  // Prendre les 5 premiers jours
  const next5Days = Object.entries(dailyForecasts).slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {next5Days.map(([date, forecasts]) => {
        const dayForecast = forecasts[0]; // Prendre la première prévision du jour
        const maxTemp = Math.max(...forecasts.map((f) => f.main.temp_max));
        const minTemp = Math.min(...forecasts.map((f) => f.main.temp_min));

        return (
          <div key={date} className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-center">
              <h3 className="font-semibold text-gray-800 mb-2">
                {formatDate(dayForecast.dt)}
              </h3>

              <div className="flex justify-center mb-3">
                <Image
                  src={getWeatherIcon(dayForecast.weather[0].icon)}
                  alt={dayForecast.weather[0].description}
                  width={60}
                  height={60}
                />
              </div>

              <p className="text-sm text-gray-600 capitalize mb-2">
                {dayForecast.weather[0].description}
              </p>

              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-600 font-semibold">
                  {Math.round(maxTemp)}°C
                </span>
                <span className="text-gray-500">{Math.round(minTemp)}°C</span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Humidité</span>
                  <span>{dayForecast.main.humidity}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Vent</span>
                  <span>{Math.round(dayForecast.wind.speed)} km/h</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
