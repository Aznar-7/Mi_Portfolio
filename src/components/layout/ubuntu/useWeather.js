import { useState, useEffect } from 'react';

// Current weather from Open-Meteo (no API key); falls back to Buenos Aires
export function useWeather() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
        );
        if (!res.ok) return;
        const data = await res.json();
        const code = data.current_weather?.weathercode ?? 0;
        const temp = Math.round(data.current_weather?.temperature ?? 0);
        setWeather({ temp, code });
      } catch { /* silent fail */ }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        ()  => fetchWeather(-34.6037, -58.3816),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(-34.6037, -58.3816);
    }
  }, []);

  return weather;
}
