import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Weather helpers ──────────────────────────────────────────────
const WMO = {
  emoji: (c) => {
    if (c === 0)  return '☀️';
    if (c <= 2)   return '🌤️';
    if (c <= 3)   return '⛅';
    if (c <= 48)  return '🌫️';
    if (c <= 55)  return '🌦️';
    if (c <= 67)  return '🌧️';
    if (c <= 77)  return '❄️';
    if (c <= 82)  return '🌦️';
    if (c <= 99)  return '⛈️';
    return '🌤️';
  },
  label: (c) => {
    if (c === 0)  return 'Despejado';
    if (c <= 2)   return 'Mayormente despejado';
    if (c <= 3)   return 'Parcialmente nublado';
    if (c <= 48)  return 'Niebla';
    if (c <= 55)  return 'Llovizna';
    if (c <= 67)  return 'Lluvia';
    if (c <= 77)  return 'Nevada';
    if (c <= 82)  return 'Chubascos';
    if (c <= 99)  return 'Tormenta';
    return 'Despejado';
  },
};

function getBg(code, isDay) {
  if (!isDay)   return ['#0f1923', '#0d2137', '#0a1628'];
  if (code === 0) return ['#1a6fc4', '#2196f3', '#64b5f6'];
  if (code <= 3)  return ['#3a6fa8', '#5689c0', '#7aafd4'];
  if (code <= 48) return ['#4a5568', '#5f6f82', '#768a9e'];
  if (code <= 77) return ['#2d4a6e', '#3a5e85', '#4d7499'];
  if (code <= 99) return ['#1a2f45', '#1e3a54', '#263f5e'];
  return ['#1a6fc4', '#2196f3', '#64b5f6'];
}

function MetricCard({ emoji, label, value, sub }) {
  return (
    <div className="bg-white/[0.12] backdrop-blur-md rounded-2xl p-4 border border-white/[0.1] flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-white/50 text-[10px] uppercase tracking-widest font-semibold">
        <span>{emoji}</span>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-semibold text-white leading-none">{value}</div>
      {sub && <div className="text-xs text-white/40">{sub}</div>}
    </div>
  );
}

function TempBar({ min, max, dayMin, dayMax }) {
  const range = dayMax - dayMin || 1;
  const leftPct = ((min - dayMin) / range) * 100;
  const widthPct = ((max - min) / range) * 100;
  return (
    <div className="relative flex-1 h-1 rounded-full bg-white/15 mx-3 my-auto">
      <div
        className="absolute h-full rounded-full bg-gradient-to-r from-blue-300 to-orange-300"
        style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 8)}%` }}
      />
    </div>
  );
}

export function WeatherApp() {
  const [data, setData]       = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState('main'); // 'main' | 'forecast'

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        ()    => fetchWeather(-34.6037, -58.3816)
      );
    } else {
      fetchWeather(-34.6037, -58.3816);
    }
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);

      const [cityRes, wxRes] = await Promise.all([
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`),
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_mean&timezone=auto&forecast_days=7`),
      ]);

      const cityData = await cityRes.json();
      const wData    = await wxRes.json();

      const city = cityData.city || cityData.locality || cityData.countryName || '—';

      // Find starting hour index for hourly strip
      const now       = new Date();
      const padded    = (n) => String(n).padStart(2, '0');
      const nowHour   = `${now.getFullYear()}-${padded(now.getMonth()+1)}-${padded(now.getDate())}T${padded(now.getHours())}:00`;
      let   startIdx  = wData.hourly.time.findIndex(t => t >= nowHour);
      if (startIdx < 0) startIdx = 0;

      const hourly = wData.hourly.time.slice(startIdx, startIdx + 24).map((t, i) => {
        const idx = startIdx + i;
        const h   = new Date(t + ':00').getHours();
        return {
          label: i === 0 ? 'Ahora' : `${h}:00`,
          temp:  wData.hourly.temperature_2m[idx],
          feels: wData.hourly.apparent_temperature?.[idx],
          code:  wData.hourly.weathercode[idx],
        };
      });

      setData({
        city,
        current:  wData.current_weather,
        feelsLike: wData.hourly.apparent_temperature?.[startIdx],
        daily:    wData.daily,
        hourly,
      });
    } catch (e) {
      console.error(e);
      setError('No se pudo cargar el clima.');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a4a8a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="text-4xl"
        >
          🌀
        </motion.div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a2f45] text-white p-6 gap-4">
        <span className="text-4xl">⚠️</span>
        <p className="text-sm text-white/60 text-center">{error}</p>
        <button
          onClick={() => fetchWeather(-34.6037, -58.3816)}
          className="px-5 py-2 bg-white/15 hover:bg-white/25 rounded-full text-sm transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { city, current, feelsLike, daily, hourly } = data;
  const isDay   = current.is_day === 1;
  const [c1, c2, c3] = getBg(current.weathercode, isDay);
  const todayMax  = Math.round(daily.temperature_2m_max[0]);
  const todayMin  = Math.round(daily.temperature_2m_min[0]);

  // Global min/max for temp bars
  const allMaxes = daily.temperature_2m_max;
  const allMins  = daily.temperature_2m_min;
  const weekMax  = Math.max(...allMaxes);
  const weekMin  = Math.min(...allMins);

  const dayLabel = (dateStr, idx) => {
    if (idx === 0) return 'Hoy';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  };

  return (
    <div
      className="w-full h-full flex flex-col text-white overflow-hidden font-sans select-none"
      style={{ background: `linear-gradient(160deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)` }}
    >
      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none' }}>

        {/* ── Hero ── */}
        <div className="px-5 pt-7 pb-2 text-center">
          <p className="text-[13px] font-medium text-white/60 tracking-wide mb-0.5">{city}</p>
          <div
            className="text-[80px] font-extralight leading-none tracking-tighter mb-1"
            style={{ textShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
          >
            {Math.round(current.temperature)}°
          </div>
          <p className="text-[15px] font-medium text-white/80 mb-0.5">{WMO.label(current.weathercode)}</p>
          <p className="text-[12px] text-white/40">
            Máx. {todayMax}° · Mín. {todayMin}°
            {feelsLike !== undefined && ` · Sensación ${Math.round(feelsLike)}°`}
          </p>
        </div>

        {/* ── Big emoji ── */}
        <motion.div
          className="flex justify-center py-3"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.1 }}
        >
          <span className="text-[72px] drop-shadow-2xl" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }}>
            {WMO.emoji(current.weathercode)}
          </span>
        </motion.div>

        {/* ── Hourly strip ── */}
        <div className="mx-4 mb-3 bg-white/[0.12] backdrop-blur-md rounded-2xl border border-white/[0.1] overflow-hidden">
          <p className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-widest text-white/40 font-semibold border-b border-white/[0.07]">
            Pronóstico por hora
          </p>
          <div className="flex gap-4 overflow-x-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
            {hourly.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[44px]"
              >
                <span className="text-[11px] text-white/50 font-medium">{h.label}</span>
                <span className="text-xl">{WMO.emoji(h.code)}</span>
                <span className="text-[13px] font-semibold">{Math.round(h.temp)}°</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── 7-day forecast ── */}
        <div className="mx-4 mb-3 bg-white/[0.12] backdrop-blur-md rounded-2xl border border-white/[0.1] overflow-hidden">
          <p className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-widest text-white/40 font-semibold border-b border-white/[0.07]">
            Próximos 7 días
          </p>
          {daily.time.slice(0, 7).map((dateStr, idx) => (
            <div
              key={idx}
              className="flex items-center px-4 py-2.5 border-b border-white/[0.06] last:border-0"
            >
              <span className="w-10 text-[13px] font-medium text-white/80 capitalize">{dayLabel(dateStr, idx)}</span>
              <span className="text-lg mx-2">{WMO.emoji(daily.weathercode[idx])}</span>
              {daily.precipitation_probability_mean?.[idx] > 20 && (
                <span className="text-[10px] text-blue-300 font-semibold mr-2 w-7">
                  {daily.precipitation_probability_mean[idx]}%
                </span>
              )}
              {!(daily.precipitation_probability_mean?.[idx] > 20) && <span className="mr-2 w-7" />}
              <span className="text-[13px] text-white/40 w-7 text-right">{Math.round(daily.temperature_2m_min[idx])}°</span>
              <TempBar
                min={daily.temperature_2m_min[idx]}
                max={daily.temperature_2m_max[idx]}
                dayMin={weekMin}
                dayMax={weekMax}
              />
              <span className="text-[13px] font-semibold w-7">{Math.round(daily.temperature_2m_max[idx])}°</span>
            </div>
          ))}
        </div>

        {/* ── Metrics grid ── */}
        <div className="mx-4 mb-5 grid grid-cols-2 gap-2.5">
          <MetricCard emoji="💨" label="Viento" value={`${Math.round(current.windspeed)} km/h`} />
          <MetricCard
            emoji="🌡️"
            label="Sensación"
            value={feelsLike !== undefined ? `${Math.round(feelsLike)}°` : `${Math.round(current.temperature)}°`}
            sub={feelsLike !== undefined && feelsLike < current.temperature - 2 ? 'Más frío de lo que parece' : undefined}
          />
          {daily.precipitation_probability_mean?.[0] !== undefined && (
            <MetricCard
              emoji="🌂"
              label="Prob. lluvia"
              value={`${daily.precipitation_probability_mean[0]}%`}
              sub={daily.precipitation_probability_mean[0] > 60 ? 'Lleva paraguas' : undefined}
            />
          )}
          <MetricCard emoji="🌅" label="Momento" value={isDay ? 'Día' : 'Noche'} sub={`Zona ${Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1] || 'local'}`} />
        </div>
      </div>
    </div>
  );
}
