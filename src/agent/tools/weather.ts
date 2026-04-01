import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getEnv } from '../../config/env.js';

// ──────────────────────────────────────────────
// Interfaces internas para tipar la respuesta de WeatherAPI.com
// ──────────────────────────────────────────────

interface WeatherAPICondition {
  text: string;
}

interface WeatherAPICurrent {
  temp_c: number;
  feelslike_c: number;
  condition: WeatherAPICondition;
  humidity: number;
  wind_kph: number;
  is_day: number; // 1 = día, 0 = noche
  uv: number;
  precip_mm: number;
}

interface WeatherAPIForecastDay {
  day: {
    mintemp_c: number;
    maxtemp_c: number;
    uv: number;
    daily_chance_of_rain: number;
    condition: WeatherAPICondition;
  };
}

interface WeatherAPIResponse {
  location: {
    name: string;
    country: string;
  };
  current: WeatherAPICurrent;
  forecast: {
    forecastday: WeatherAPIForecastDay[];
  };
}

// ──────────────────────────────────────────────
// Interfaces públicas de la herramienta
// ──────────────────────────────────────────────

export interface WeatherInput {
  city: string;
}

export interface WeatherForAgent {
  city: string;
  country: string;
  temp_c: number;
  feels_like_c: number;
  condition: string;
  humidity: number;
  wind_kph: number;
  uv_max: number;
  min_temp: number;
  max_temp: number;
  thermal_amplitude: number;
  chance_of_rain: number;
  time_of_day: 'day' | 'night';
  needs_umbrella: boolean;
  needs_sunscreen: boolean;
  needs_extra_layer: boolean;
  clothing_advice: string;
}

// ──────────────────────────────────────────────
// Lógica de recomendaciones de vestuario
// ──────────────────────────────────────────────

function buildClothingAdvice(
  temp: number,
  needsUmbrella: boolean,
  needsSunscreen: boolean,
  needsExtraLayer: boolean
): string {
  const parts: string[] = [];

  if (temp >= 30) {
    parts.push('Día muy caluroso.');
  } else if (temp >= 22) {
    parts.push('Día cálido.');
  } else if (temp >= 15) {
    parts.push('Temperatura agradable.');
  } else if (temp >= 8) {
    parts.push('Día fresco.');
  } else {
    parts.push('Día frío.');
  }

  if (needsExtraLayer) parts.push('Lleva abrigo o chaqueta.');
  if (needsSunscreen) parts.push('Usa protector solar SPF50+.');
  if (needsUmbrella) parts.push('Lleva paraguas.');

  return parts.join(' ');
}

// ──────────────────────────────────────────────
// Transforma la respuesta cruda de la API al formato del agente
// ──────────────────────────────────────────────

export function buildWeatherResult(data: WeatherAPIResponse): WeatherForAgent {
  const current = data.current;
  const forecastDay = data.forecast.forecastday[0].day;

  const minTemp = forecastDay.mintemp_c;
  const maxTemp = forecastDay.maxtemp_c;
  const uvMax = forecastDay.uv;
  const chanceOfRain = forecastDay.daily_chance_of_rain;

  const needsUmbrella = chanceOfRain > 30 || current.precip_mm > 0;
  const needsSunscreen = uvMax > 6;
  const needsExtraLayer = minTemp < 15;

  return {
    city: data.location.name,
    country: data.location.country,
    temp_c: current.temp_c,
    feels_like_c: current.feelslike_c,
    condition: current.condition.text,
    humidity: current.humidity,
    wind_kph: current.wind_kph,
    uv_max: uvMax,
    min_temp: minTemp,
    max_temp: maxTemp,
    thermal_amplitude: Math.round((maxTemp - minTemp) * 10) / 10,
    chance_of_rain: chanceOfRain,
    time_of_day: current.is_day === 1 ? 'day' : 'night',
    needs_umbrella: needsUmbrella,
    needs_sunscreen: needsSunscreen,
    needs_extra_layer: needsExtraLayer,
    clothing_advice: buildClothingAdvice(current.temp_c, needsUmbrella, needsSunscreen, needsExtraLayer),
  };
}

// ──────────────────────────────────────────────
// Formatea el resultado como string ≤ 500 caracteres
// ──────────────────────────────────────────────

export function formatWeatherResponse(weather: WeatherForAgent): string {
  const raw = JSON.stringify(weather);

  if (raw.length <= 500) return raw;

  // Si excede 500 chars, devolvemos un resumen compacto con los datos esenciales
  const summary = JSON.stringify({
    city: weather.city,
    country: weather.country,
    temp_c: weather.temp_c,
    condition: weather.condition,
    min_temp: weather.min_temp,
    max_temp: weather.max_temp,
    chance_of_rain: weather.chance_of_rain,
    needs_umbrella: weather.needs_umbrella,
    needs_sunscreen: weather.needs_sunscreen,
    needs_extra_layer: weather.needs_extra_layer,
    clothing_advice: weather.clothing_advice,
  });

  if (summary.length <= 500) return summary;

  // Último recurso: truncar con elipsis
  return summary.slice(0, 497) + '...';
}

// ──────────────────────────────────────────────
// Herramienta principal — sigue el mismo patrón que calculator y currentTime
// ──────────────────────────────────────────────

export const weatherTool = tool(
  async ({ city }) => {
    const { WEATHER_API_KEY } = getEnv();
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&days=1&lang=es`;

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      return JSON.stringify({
        error: 'No se pudo conectar con el servicio de clima.',
        suggestion: 'Verifica tu conexión a internet e intenta de nuevo.',
      });
    }

    if (response.status === 400 || response.status === 404) {
      return JSON.stringify({
        error: `Ciudad no encontrada: '${city}'`,
        suggestion: "Intenta con 'Ciudad, País' (ej: 'Madrid, España')",
      });
    }

    if (!response.ok) {
      return JSON.stringify({
        error: `Error al consultar el clima (código ${response.status}).`,
        suggestion: 'Intenta de nuevo en unos momentos.',
      });
    }

    const data = (await response.json()) as WeatherAPIResponse;
    const weather = buildWeatherResult(data);
    return formatWeatherResponse(weather);
  },
  {
    name: 'weather',
    description:
      'Consulta el clima actual y pronóstico del día para una ciudad. ' +
      'Úsala cuando el usuario pregunte sobre temperatura, lluvia, viento, ' +
      'qué ropa llevar o si necesita paraguas. ' +
      'Requiere el nombre de la ciudad explícito. ' +
      'Formato de entrada: {"city": "Nombre Ciudad, País"}',
    schema: z.object({
      city: z.string().describe('Nombre de la ciudad, preferiblemente con país. Ej: "Santiago, Chile"'),
    }),
  },
);
