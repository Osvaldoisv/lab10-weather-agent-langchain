# Brief de herramienta Weather API

## 1. Título de la tarea

Incorporar una herramienta de consulta meteorológica (Weather API) al agente didáctico, permitiéndole responder preguntas sobre el clima actual y pronóstico en español, utilizando datos reales de WeatherAPI.com.

---

## 2. Contexto

Actualmente el agente didáctico ya cuenta con dos herramientas funcionales: una para realizar cálculos matemáticos simples y otra para consultar la hora actual. Ambas están implementadas siguiendo una arquitectura por capas que facilita la incorporación de nuevas capacidades.

El proyecto ha demostrado que es posible:

- Recibir preguntas en lenguaje natural.
- Decidir si corresponde usar una herramienta o responder directamente.
- Ejecutar herramientas de forma aislada y entregar respuestas claras en español.
- Mantener una estructura ordenada que permite crecer sin romper lo existente.

El siguiente paso natural es ampliar el dominio de conocimiento del agente hacia información meteorológica. Esto representa un desafío valioso porque:

- Introduce una herramienta que consume una API externa real.
- Requiere manejo de parámetros como ciudad y formato de respuesta.
- Obliga a procesar datos estructurados (JSON) para extraer solo lo relevante.
- Refuerza buenas prácticas de validación, manejo de errores y configuración por entorno.

El objetivo es agregar esta nueva herramienta siguiendo el mismo patrón que ya existe, manteniendo la calidad pedagógica y funcional del proyecto.

---

## 3. Requerimientos del proyecto

### Lenguaje y stack

- TypeScript sobre Node.js moderno.
- LangChain para la composición del agente y herramientas.
- OpenRouter como proveedor del modelo de lenguaje.
- Fetch nativo para realizar peticiones HTTP.
- Variables de entorno para configuración sensible.

### Herramienta a implementar

Se debe crear una nueva herramienta llamada weather o clima que permita al agente responder preguntas sobre el **clima actual y pronóstico del día** en español.

Ejemplos de preguntas que la herramienta debe responder:

- "¿Qué clima hace hoy en Santiago?"
- "¿Va a llover en Buenos Aires?"
- "¿Qué temperatura máxima habrá hoy en Madrid?"
- "¿Necesito paraguas en Bogotá?"

La herramienta debe:

1. Recibir como parámetro la ciudad o ubicación consultada.
2. Realizar una petición a WeatherAPI.com usando la API Key correspondiente.
3. Procesar la respuesta JSON extrayendo únicamente los campos relevantes para recomendar vestimenta y dar información del clima (temperatura actual, mínima, máxima, sensación térmica, probabilidad de lluvia, viento, humedad, condición del cielo).
4. Limitar la respuesta a un **máximo de 500 caracteres** para asegurar que el LLM procese la información de forma eficiente.
5. Devolver un objeto estructurado con la información procesada que pueda ser interpretado por el agente.

### Input esperado por la herramienta

La herramienta debe recibir un parámetro city (string) con la ciudad o ubicación consultada.

Ejemplo de invocación esperada desde el agente:
tool.invoke({ city: "Santiago, Chile" })

### Output esperado

La herramienta debe retornar un objeto con la siguiente estructura (consistente con el esquema definido):

interface WeatherForAgent {
  location: {
    name: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    condition_text: string;
    is_day: boolean;
    wind_kph: number;
    humidity: number;
    uv: number;
    precip_mm: number;
  };
  today: {
    min_temp_c: number;
    max_temp_c: number;
    chance_of_rain: number;
    condition_text: string;
    uv_max: number;
  };
  recommendations: {
    thermal_amplitude: number;
    time_of_day: 'day' | 'night';
    needs_umbrella: boolean;
    needs_sunscreen: boolean;
    needs_extra_layer: boolean;
    clothing_advice: string;
  };
}

### Modificación del prompt del agente

El archivo que contiene el prompt principal del agente debe actualizarse para:

1. Incluir en la descripción de herramientas la nueva capacidad de consultar el clima.
2. Explicar al modelo en qué situaciones debe usar la herramienta del clima (cuando la pregunta involucre clima, temperatura, lluvia, vestimenta sugerida, etc.).
3. Mantener la coherencia con las herramientas existentes (cálculo y hora).

El prompt debe redactarse en español y ser claro sobre los límites de la herramienta (por ejemplo, requiere ciudad explícita, no adivina ubicación por IP).

### Modificación de guardrails.md

El archivo guardrails.md debe actualizarse para incluir:

- La nueva herramienta weather como una capacidad válida del agente.
- Criterios de uso: cuándo es apropiado invocarla y cuándo no.
- Ejemplos de preguntas que deben activar la herramienta.
- Consideraciones de privacidad: la herramienta no debe almacenar ubicaciones de usuarios.
- Manejo de errores: qué hacer si la API no responde o si la ciudad no existe.

---

## 4. Restricciones

- No modificar la estructura de capas existente. La nueva herramienta debe ubicarse en la capa de capacidades (src/tools/ o similar) siguiendo el patrón de las herramientas actuales.
- No introducir dependencias innecesarias. Si se usa fetch, ya está disponible en Node.js moderno.
- Mantener la simplicidad pedagógica: el código debe ser legible, con nombres claros y comentarios útiles.
- La API Key debe leerse desde variable de entorno (WEATHER_API_KEY) y validarse al inicio como ya ocurre con otras configuraciones.
- Si la ciudad no se encuentra o la API retorna error, la herramienta debe devolver un mensaje de error amigable y no romper la ejecución del agente.
- Preservar compatibilidad con ejecución por consola y pruebas existentes.
- Las respuestas de la herramienta no deben exceder 500 caracteres para optimizar el procesamiento por el LLM.

---

## 5. Definition of Done (DoD)

El trabajo se considera terminado cuando:

- La herramienta weather está implementada en TypeScript siguiendo el patrón de herramientas existentes.
- La herramienta consume correctamente WeatherAPI.com y procesa la respuesta según el esquema definido.
- Se crean tests unitarios para la herramienta weather en el archivo `tests/weather.test.ts`, con cobertura similar a `calculator.test.ts` y `currentTime.test.ts`.
- El prompt del agente ha sido actualizado para incluir la nueva capacidad y sus instrucciones de uso.
- El archivo guardrails.md ha sido actualizado documentando la nueva herramienta.
- Las variables de entorno requeridas están documentadas (ejemplo en .env.example).
- El agente puede responder correctamente al menos tres preguntas distintas sobre clima del día actual en diferentes ciudades.
- La respuesta de la herramienta no excede 500 caracteres.
- No se rompe ninguna funcionalidad existente (cálculo y hora siguen funcionando).
- El código ha sido revisado para mantener claridad pedagógica y buenas prácticas.
