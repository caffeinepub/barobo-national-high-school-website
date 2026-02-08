import { Cloud, CloudRain, Sun, CloudSnow, CloudDrizzle, CloudLightning, Loader2, AlertCircle } from 'lucide-react';
import { useBaroboWeather } from '../hooks/useBaroboWeather';

// Map weather codes to icons
const getWeatherIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun className="h-8 w-8 text-yellow-500" />;
  if (code === 2 || code === 3) return <Cloud className="h-8 w-8 text-gray-500" />;
  if (code >= 51 && code <= 57) return <CloudDrizzle className="h-8 w-8 text-blue-400" />;
  if (code >= 61 && code <= 67) return <CloudRain className="h-8 w-8 text-blue-600" />;
  if (code >= 71 && code <= 77) return <CloudSnow className="h-8 w-8 text-blue-300" />;
  if (code >= 80 && code <= 82) return <CloudRain className="h-8 w-8 text-blue-700" />;
  if (code >= 95) return <CloudLightning className="h-8 w-8 text-purple-600" />;
  return <Cloud className="h-8 w-8 text-gray-400" />;
};

export default function WeatherForecastSection() {
  const { data: weather, isLoading, isError } = useBaroboWeather();

  if (isLoading) {
    return (
      <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-md">
        <h3 className="mb-4 text-center text-xl font-bold text-[#800000]">
          Weather Forecast - Barobo, Caraga
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (isError || !weather) {
    return (
      <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-md">
        <h3 className="mb-4 text-center text-xl font-bold text-[#800000]">
          Weather Forecast - Barobo, Caraga
        </h3>
        <div className="flex items-center justify-center gap-3 py-8 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <p className="text-sm">Unable to load weather data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-md">
      <h3 className="mb-4 text-center text-xl font-bold text-[#800000]">
        Weather Forecast - Barobo, Caraga
      </h3>
      
      {/* Current Weather */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Current Weather</p>
            <p className="text-3xl font-bold text-[#800000]">{weather.current.temperature}°C</p>
            <p className="text-sm text-gray-700">{weather.current.weatherDescription}</p>
          </div>
          <div className="flex items-center justify-center">
            {getWeatherIcon(weather.current.weatherCode)}
          </div>
        </div>
      </div>

      {/* 3-Day Forecast */}
      <div className="grid grid-cols-3 gap-3">
        {weather.forecast.map((day, index) => (
          <div
            key={index}
            className="rounded-lg bg-white p-3 text-center shadow-sm transition-transform hover:scale-105"
          >
            <p className="mb-2 text-sm font-semibold text-gray-700">{day.dayName}</p>
            <div className="mb-2 flex justify-center">
              {getWeatherIcon(day.weatherCode)}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">
                <span className="font-semibold text-red-600">{day.temperatureMax}°</span>
                {' / '}
                <span className="font-semibold text-blue-600">{day.temperatureMin}°</span>
              </p>
              <p className="text-xs text-gray-600">{day.weatherDescription}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
