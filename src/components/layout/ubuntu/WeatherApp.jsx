import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Sun, AlertCircle } from 'lucide-react';

export function WeatherApp() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        setLoading(true);
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
        const data = await res.json();
        setWeatherData(data);
        setError(null);
      } catch (err) {
        setError('No se pudo obtener el clima.');
      } finally {
        setLoading(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(-34.6037, -58.3816) // Default BsAs
      );
    } else {
      fetchWeather(-34.6037, -58.3816);
    }
  }, []);

  if (loading) return <div className="h-full bg-[#111] text-white flex items-center justify-center p-8 animate-pulse"><Sun className="animate-spin text-yellow-400" size={40} /></div>;
  if (error || !weatherData) return <div className="h-full bg-[#111] text-red-400 flex items-center justify-center p-8"><AlertCircle className="mr-2" /> {error}</div>;

  const curr = weatherData.current_weather;
  const temp = Math.round(curr.temperature);
  const isNight = curr.is_day === 0;

  // Simple weather code map
  const getIcon = (code) => {
    if (code <= 1) return <Sun className="text-yellow-400" size={64} style={{ fill: 'currentColor' }} />;
    if (code <= 3) return <Cloud className="text-gray-300" size={64} style={{ fill: 'currentColor' }} />;
    return <Droplets className="text-blue-400" size={64} style={{ fill: 'currentColor' }} />;
  };

  const getDesc = (code) => {
    if (code <= 1) return isNight ? 'Despejado' : 'Soleado';
    if (code <= 3) return 'Nublado';
    if (code <= 49) return 'Niebla';
    if (code <= 69) return 'Lluvia ligera';
    if (code <= 79) return 'Nieve';
    if (code <= 99) return 'Tormenta';
    return 'Desconocido';
  };

  const daily = weatherData.daily;

  return (
    <div className="h-full bg-gradient-to-br from-[#1e1e2f] to-[#111] text-white flex flex-col font-sans select-none">
      <div className="flex flex-col items-center justify-center flex-1 p-8">
        <div className="mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {getIcon(curr.weathercode)}
        </div>
        <div className="text-6xl font-light tracking-tighter mb-2">{temp}°C</div>
        <div className="text-lg text-white/70 font-medium mb-1 drop-shadow-md">
          {getDesc(curr.weathercode)}
        </div>
        <div className="flex items-center gap-4 text-sm text-white/50 mt-4 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className="flex items-center gap-1.5"><Wind size={14}/> {curr.windspeed} km/h</span>
            <div className="w-px h-3 bg-white/20"></div>
            <span className="flex items-center gap-1.5 min-w-[70px]"> Dir: {curr.winddirection}°</span>
        </div>
      </div>

      {daily && daily.time && (
      <div className="bg-white/5 border-t border-white/10 p-4">
        <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3 px-1">Próximos días</div>
        <div className="flex justify-between gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
           {daily.time.slice(1, 6).map((dateStr, i) => {
              const dayIndex = i + 1;
              const date = new Date(dateStr + 'T00:00:00');
              const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
              return (
                  <div key={dateStr} className="flex flex-col items-center gap-2 bg-white/5 border border-white/5 rounded-xl p-3 flex-1 min-w-[70px]">
                      <span className="text-[11px] capitalize text-white/50 font-medium">{dayName}</span>
                      <div className="scale-75 origin-center">
                          {getIcon(daily.weathercode[dayIndex])}
                      </div>
                      <span className="text-[13px] font-semibold">{Math.round(daily.temperature_2m_max[dayIndex])}°</span>
                      <span className="text-[11px] text-white/30">{Math.round(daily.temperature_2m_min[dayIndex])}°</span>
                  </div>
              );
           })}
        </div>
      </div>
      )}
    </div>
  );
}