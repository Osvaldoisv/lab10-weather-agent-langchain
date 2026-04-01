import { describe, expect, it, vi, afterEach } from 'vitest';
import { buildWeatherResult, formatWeatherResponse, weatherTool } from '../src/agent/tools/weather.js';

// ──────────────────────────────────────────────
// Datos de respuesta simulada de WeatherAPI.com
// ──────────────────────────────────────────────

function makeMockResponse(overrides: {
  mintemp_c?: number;
  maxtemp_c?: number;
  uv?: number;
  daily_chance_of_rain?: number;
  precip_mm?: number;
  temp_c?: number;
  is_day?: number;
  cityName?: string;
} = {}) {
  return {
    location: { name: overrides.cityName ?? 'Santiago', country: 'Chile' },
    current: {
      temp_c: overrides.temp_c ?? 20,
      feelslike_c: 19,
      condition: { text: 'Soleado' },
      humidity: 50,
      wind_kph: 15,
      is_day: overrides.is_day ?? 1,
      uv: 5,
      precip_mm: overrides.precip_mm ?? 0,
    },
    forecast: {
      forecastday: [
        {
          day: {
            mintemp_c: overrides.mintemp_c ?? 10,
            maxtemp_c: overrides.maxtemp_c ?? 25,
            uv: overrides.uv ?? 5,
            daily_chance_of_rain: overrides.daily_chance_of_rain ?? 10,
            condition: { text: 'Soleado' },
          },
        },
      ],
    },
  };
}

// ──────────────────────────────────────────────
// Tests de buildWeatherResult
// ──────────────────────────────────────────────

describe('buildWeatherResult', () => {
  it('calcula thermal_amplitude correctamente', () => {
    const data = makeMockResponse({ mintemp_c: 10, maxtemp_c: 25 });
    const result = buildWeatherResult(data);
    expect(result.thermal_amplitude).toBe(15);
  });

  it('determina time_of_day correctamente', () => {
    expect(buildWeatherResult(makeMockResponse({ is_day: 1 })).time_of_day).toBe('day');
    expect(buildWeatherResult(makeMockResponse({ is_day: 0 })).time_of_day).toBe('night');
  });
});

// ──────────────────────────────────────────────
// Tests de recomendaciones
// ──────────────────────────────────────────────

describe('recomendaciones de vestuario', () => {
  it('needs_extra_layer = true cuando min_temp < 15', () => {
    const result = buildWeatherResult(makeMockResponse({ mintemp_c: 8 }));
    expect(result.needs_extra_layer).toBe(true);
    expect(result.clothing_advice).toContain('chaqueta');
  });

  it('needs_extra_layer = false cuando min_temp >= 15', () => {
    const result = buildWeatherResult(makeMockResponse({ mintemp_c: 16 }));
    expect(result.needs_extra_layer).toBe(false);
  });

  it('needs_sunscreen = true cuando uv_max > 6', () => {
    const result = buildWeatherResult(makeMockResponse({ uv: 9 }));
    expect(result.needs_sunscreen).toBe(true);
    expect(result.clothing_advice).toContain('protector solar');
  });

  it('needs_sunscreen = false cuando uv_max <= 6', () => {
    const result = buildWeatherResult(makeMockResponse({ uv: 3 }));
    expect(result.needs_sunscreen).toBe(false);
  });

  it('needs_umbrella = true cuando chance_of_rain > 30', () => {
    const result = buildWeatherResult(makeMockResponse({ daily_chance_of_rain: 60 }));
    expect(result.needs_umbrella).toBe(true);
    expect(result.clothing_advice).toContain('paraguas');
  });

  it('needs_umbrella = true cuando hay precipitación actual', () => {
    const result = buildWeatherResult(makeMockResponse({ precip_mm: 2, daily_chance_of_rain: 10 }));
    expect(result.needs_umbrella).toBe(true);
  });

  it('needs_umbrella = false cuando chance_of_rain <= 30 y sin lluvia', () => {
    const result = buildWeatherResult(makeMockResponse({ daily_chance_of_rain: 20, precip_mm: 0 }));
    expect(result.needs_umbrella).toBe(false);
  });
});

// ──────────────────────────────────────────────
// Tests de formatWeatherResponse (límite 500 chars)
// ──────────────────────────────────────────────

describe('formatWeatherResponse', () => {
  it('respuesta normal no excede 500 caracteres', () => {
    const weather = buildWeatherResult(makeMockResponse());
    const formatted = formatWeatherResponse(weather);
    expect(formatted.length).toBeLessThanOrEqual(500);
  });

  it('respuesta con ciudad de nombre muy largo se trunca a <= 500 chars', () => {
    const longCityName = 'A'.repeat(200);
    const data = makeMockResponse({ cityName: longCityName });
    const weather = buildWeatherResult(data);
    const formatted = formatWeatherResponse(weather);
    expect(formatted.length).toBeLessThanOrEqual(500);
  });

  it('respuesta truncada termina con ... si es necesario', () => {
    // Crear un weather con un clothing_advice muy largo para forzar truncamiento extremo
    const weather = buildWeatherResult(makeMockResponse());
    // Forzamos un campo muy largo artificialmente
    weather.clothing_advice = 'C'.repeat(500);
    const formatted = formatWeatherResponse(weather);
    expect(formatted.length).toBeLessThanOrEqual(500);
  });
});

// ──────────────────────────────────────────────
// Tests de integración del tool con fetch mockeado
// ──────────────────────────────────────────────

describe('weatherTool', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devuelve datos de clima para ciudad válida', async () => {
    const mockData = makeMockResponse();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    }));

    const result = await weatherTool.invoke({ city: 'Santiago, Chile' });
    const parsed = JSON.parse(result as string);

    expect(parsed.city).toBe('Santiago');
    expect(parsed.country).toBe('Chile');
    expect(typeof parsed.temp_c).toBe('number');
    expect(typeof parsed.needs_umbrella).toBe('boolean');
    expect((result as string).length).toBeLessThanOrEqual(500);
  });

  it('retorna error cuando la ciudad no es encontrada (status 400)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
    }));

    const result = await weatherTool.invoke({ city: 'CiudadInexistente123' });
    const parsed = JSON.parse(result as string);

    expect(parsed.error).toContain('Ciudad no encontrada');
    expect(parsed.suggestion).toBeDefined();
  });

  it('retorna error de conexión sin lanzar excepción', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const result = await weatherTool.invoke({ city: 'Santiago' });
    const parsed = JSON.parse(result as string);

    expect(parsed.error).toContain('conectar');
  });
});
