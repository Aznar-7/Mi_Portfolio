import { createElement } from 'react';
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

// WMO weather interpretation codes → icon
function iconFor(code) {
  if (code === 0) return Sun;
  if (code <= 2) return CloudSun;
  if (code <= 3) return Cloud;
  if (code <= 48) return CloudFog;
  if (code <= 55) return CloudDrizzle;
  if (code <= 67) return CloudRain;
  if (code <= 77) return CloudSnow;
  if (code <= 82) return CloudRain;
  return CloudLightning;
}

export function WeatherIcon({ code, size = 16, ...props }) {
  return createElement(iconFor(code ?? 0), { size, 'aria-hidden': true, ...props });
}
