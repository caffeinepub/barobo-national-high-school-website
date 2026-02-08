import { useQuery } from '@tanstack/react-query';

// Barobo, Caraga coordinates
const BAROBO_LAT = 8.5667;
const BAROBO_LON = 126.1833;

export interface WeatherCondition {
  date: string;
  dayName: string;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface BaroboWeatherData {
  current: CurrentWeather;
  forecast: WeatherCondition[];
}

// Weather code to description mapping (WMO Weather interpretation codes)
const getWeatherDescription = (code: number): string => {
  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return weatherCodes[code] || 'Unknown';
};

export function useBaroboWeather() {
  return useQuery<BaroboWeatherData>({
    queryKey: ['baroboWeather'],
    queryFn: async () => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${BAROBO_LAT}&longitude=${BAROBO_LON}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia/Manila&forecast_days=4`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      // Parse current weather
      const current: CurrentWeather = {
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        weatherDescription: getWeatherDescription(data.current.weather_code),
      };
      
      // Parse forecast (skip today, get next 3 days)
      const forecast: WeatherCondition[] = [];
      for (let i = 1; i < 4; i++) {
        const date = new Date(data.daily.time[i]);
        forecast.push({
          date: data.daily.time[i],
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          temperatureMax: Math.round(data.daily.temperature_2m_max[i]),
          temperatureMin: Math.round(data.daily.temperature_2m_min[i]),
          weatherCode: data.daily.weather_code[i],
          weatherDescription: getWeatherDescription(data.daily.weather_code[i]),
        });
      }
      
      return { current, forecast };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    retry: 2,
  });
}
