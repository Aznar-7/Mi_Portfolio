import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, Wind, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function WeatherApp() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Intentamos obtener la ubicación
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation denied, using default (Buenos Aires):", error);
          // Default to Buenos Aires
          fetchWeather(-34.6037, -58.3816);
        }
      );
    } else {
      fetchWeather(-34.6037, -58.3816);
    }
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const cityResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`);
      const cityData = await cityResponse.json();
      const city = cityData.city || cityData.locality || "Desconocido";

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
      );
      if (!weatherResponse.ok) throw new Error("Error obtaining weather");
      const wData = await weatherResponse.json();
      
      setWeatherData({
        city,
        current: wData.current_weather,
        daily: wData.daily
      });
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el clima.");
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (code, size = 64) => {
    if (code <= 3) return <Sun size={size} className="text-yellow-400 drop-shadow-lg animate-pulse" />;
    if (code <= 48) return <Cloud size={size} className="text-gray-300 drop-shadow-md" />;
    if (code <= 69) return <CloudRain size={size} className="text-blue-400 drop-shadow-md" />;
    if (code <= 99) return <CloudLightning size={size} className="text-purple-400 drop-shadow-md" />;
    return <Sun size={size} className="text-yellow-400" />;
  };

  const getWeatherStatus = (code) => {
    if (code <= 3) return "Despejado";
    if (code <= 48) return "Nublado";
    if (code <= 69) return "Lloviendo";
    if (code <= 99) return "Tormenta";
    return "Despejado";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-lg">
        <Activity className="animate-spin text-white opacity-70" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 text-white rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-red-400 mb-2">Error</h3>
        <p className="text-gray-400">{error}</p>
        <button 
          onClick={() => fetchWeather(-34.6037, -58.3816)} 
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { city, current, daily } = weatherData;
  const isDay = current.is_day === 1;
  const bgGradient = isDay 
    ? "from-sky-400 via-blue-500 to-blue-700" 
    : "from-slate-800 via-indigo-900 to-slate-900";

  return (
    <div className={`w-full h-full flex flex-col bg-gradient-to-br ${bgGradient} text-white rounded-lg shadow-2xl overflow-hidden font-sans`}>
      <div className="p-8 flex flex-col items-center text-center relative z-10">
        <h2 className="text-3xl font-light tracking-wide mb-1 drop-shadow-md">{city}</h2>
        <p className="text-sm font-medium text-white/70 tracking-widest uppercase shadow-black/10 text-shadow-sm mb-6">
          {getWeatherStatus(current.weathercode)}
        </p>

        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 12 }}
          className="mb-6 relative"
        >
          {getWeatherIcon(current.weathercode, 96)}
        </motion.div>

        <div className="flex items-start justify-center drop-shadow-xl">
          <span className="text-7xl font-light tracking-tighter">{Math.round(current.temperature)}</span>
          <span className="text-3xl font-light mt-2 ml-1">°</span>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-6 px-6 py-3 bg-black/20 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner w-full max-w-xs">
          <div className="flex items-center gap-2">
            <Wind size={18} className="text-blue-200" />
            <span className="text-sm font-medium">{current.windspeed} km/h</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-black/30 backdrop-blur-xl border-t border-white/10 flex flex-col rounded-b-lg p-6 mt-auto flex overflow-x-auto gap-4">
        <div className="flex w-full justify-between items-center gap-4 px-2 h-full">
          {daily.time.slice(0, 5).map((dateStr, idx) => {
            const date = new Date(dateStr + "T12:00:00"); 
            const dayName = idx === 0 ? "Hoy" : date.toLocaleDateString("es-ES", { weekday: "short" });
            
            return (
              <div key={idx} className="flex flex-col items-center justify-center gap-3 w-16 h-full p-2 hover:bg-white/10 transition-colors rounded-xl flex-shrink-0">
                <span className="text-xs font-semibold uppercase text-white/70">{dayName}</span>
                {getWeatherIcon(daily.weathercode[idx], 24)}
                <div className="flex flex-col items-center justify-center text-xs">
                  <span className="font-bold">{Math.round(daily.temperature_2m_max[idx])}°</span>
                  <span className="text-white/50">{Math.round(daily.temperature_2m_min[idx])}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
