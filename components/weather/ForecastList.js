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
          <div
            key={date}
            className="bg-white rounded-lg shadow-lg overflow-hidden relative"
          >
            {/* Image de fond */}
            <div className="absolute inset-0 z-0">
              <Image
                src={getWeatherIcon(dayForecast.weather[0].icon)}
                alt={dayForecast.weather[0].description}
                fill
                className="object-cover opacity-60"
              />
            </div>

            {/* Contenu principal */}
            <div className="relative z-10 p-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="text-center">
                  <h3 className="font-bold text-gray-800 mb-2">
                    {formatDate(dayForecast.dt)}
                  </h3>

                  <div className="flex justify-center mb-3">
                    <img
                      src={`https://openweathermap.org/img/wn/${dayForecast.weather[0].icon}@2x.png`}
                      alt={dayForecast.weather[0].description}
                      width={60}
                      height={60}
                      className="drop-shadow-lg"
                    />
                  </div>

                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    {Math.round(dayForecast.main.temp)}°C
                  </p>
                  <p className="text-sm text-gray-600 capitalize mb-3 font-semibold">
                    {dayForecast.weather[0].description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500 font-semibold">Min</p>
                      <p className="font-bold text-gray-800">
                        {Math.round(dayForecast.main.temp_min)}°C
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold">Max</p>
                      <p className="font-bold text-gray-800">
                        {Math.round(dayForecast.main.temp_max)}°C
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
