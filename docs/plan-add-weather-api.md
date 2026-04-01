# Plan de Implementación: Weather API

## 1. Visión General

Agregar una herramienta de consulta meteorológica al agente didáctico que se integre con WeatherAPI.com, permitiendo responder preguntas sobre el clima actual y pronóstico del día en español.

**Complejidad**: Media (integración externa + nuevo patrón de herramienta)

---

## 2. Fases de Implementación

### Fase 1: Preparación y Configuración

**Objetivo**: Establecer la infraestructura necesaria para desarrollar la herramienta.

**Tareas**:
- [ ] 1.1 Obtener y documentar API Key de WeatherAPI.com
- [ ] 1.2 Agregar variable de entorno `WEATHER_API_KEY` a `.env` (crear si no existe) y `.env.example`
- [ ] 1.3 Actualizar `src/config/env.ts` para validar y exportar `WEATHER_API_KEY` siguiendo el patrón existente
- [ ] 1.4 Revisar estructura de capas existentes: `src/tools/calculator.ts` y `src/tools/currentTime.ts` para establecer patrón
- [ ] 1.5 Crear rama de feature o checkpoint en git (opcional pero recomendado)

**Entregable**: Configuración lista, API Key validada, estructura clara.

---

### Fase 2: Implementación de la Herramienta

**Objetivo**: Desarrollar la herramienta weather siguiendo el patrón existente.

**Tareas**:
- [ ] 2.1 Crear archivo `src/tools/weather.ts` con estructura base
- [ ] 2.2 Definir interfaces TypeScript según el esquema especificado:
  - `WeatherForAgent` (respuesta completa)
  - `WeatherInput` (parámetro de entrada: city)
  - Interfaces para estructuras intermedias de la API
- [ ] 2.3 Implementar función que consulta WeatherAPI.com:
  - Construir URL con parámetro `city`
  - Manejar errores de red y API
  - Validar que la ciudad fue encontrada
- [ ] 2.4 Implementar procesamiento de respuesta JSON:
  - Extraer datos relevantes de `current` y `forecast`
  - Calcular `thermal_amplitude` (máx - mín)
  - Determinar `time_of_day` (day/night)
  - Generar `clothing_advice` basado en condiciones
- [ ] 2.5 Implementar lógica de recomendaciones:
  - `needs_umbrella`: si `chance_of_rain` > 30% o lluvia actual
  - `needs_sunscreen`: si `uv_max` > 6
  - `needs_extra_layer`: si `min_temp` < 15°C
  - `clothing_advice`: mensaje de texto cohesivo basado en condiciones
- [ ] 2.6 Validar que respuesta no exceda 500 caracteres (truncar si es necesario)
- [ ] 2.7 Crear función de invocación consistente con otras herramientas (RunnableInterface)
- [ ] 2.8 Agregar comentarios de documentación y claridad pedagógica

**Subtareas críticas**:
- Manejo robusto de errores (ciudad no encontrada, API caída)
- Tipos TypeScript precisos y completos
- Formato de respuesta consistente

**Entregable**: Herramienta funcional con esquema correcto, sin dependencias adicionales.

---

### Fase 3: Pruebas Unitarias

**Objetivo**: Crear suite de tests para validar funcionamiento de la herramienta.

**Tareas**:
- [ ] 3.1 Crear archivo `tests/weather.test.ts` siguiendo patrón de `calculator.test.ts` y `currentTime.test.ts`
- [ ] 3.2 Implementar test de caso exitoso:
  - Invocar herramienta con ciudad válida (ej: "Santiago, Chile")
  - Validar estructura de respuesta
  - Verificar campos obligatorios presentes
  - Confirmar que respuesta ≤ 500 caracteres
- [ ] 3.3 Implementar test de error (ciudad no encontrada):
  - Invocar con ciudad inválida
  - Verificar mensaje de error apropiado
  - Confirmar que no lanza excepción no controlada
- [ ] 3.4 Implementar test de validación de recomendaciones:
  - Caso frío (min < 15): `needs_extra_layer = true`
  - Caso soleado (uv_max > 6): `needs_sunscreen = true`
  - Caso lluvioso (chance > 30): `needs_umbrella = true`
- [ ] 3.5 Implementar test de límite de caracteres:
  - Invocar con ciudad que genera respuesta larga
  - Verificar truncamiento correcto
- [ ] 3.6 Ejecutar tests localmente y confirmar cobertura similar a otras herramientas

**Entregable**: Suite de tests completa y pasando (mínimo 4-5 tests).

---

### Fase 4: Integración en el Agente

**Objetivo**: Integrar la herramienta en la composición del agente y actualizar su prompt.

**Tareas**:
- [ ] 4.1 Actualizar `src/agent/createAgent.ts`:
  - Importar la herramienta weather
  - Agregar al array de tools junto con calculator y currentTime
  - Validar que se registeriza correctamente
- [ ] 4.2 Actualizar `src/agent/prompt.ts`:
  - Agregar descripción clara de la herramienta weather en español
  - Incluir ejemplos de preguntas que disparan la herramienta (clima, lluvia, temperatura, vestimenta)
  - Explicar que requiere ciudad explícita
  - Mantener coherencia con las otras herramientas
  - Especificar formato esperado: `{"city": "nombre_ciudad, país"}`
- [ ] 4.3 Revisar lógica de invocación en `src/agent/runAgent.ts`:
  - Confirmar que weather.invoke() funciona igual que otras herramientas
  - Ajustar si es necesario
- [ ] 4.4 Realizar test manual: ejecutar el agente y hacer preguntas sobre clima
  - "¿Qué clima hace hoy en Santiago?"
  - "¿Va a llover en Buenos Aires?"
  - "¿Necesito paraguas en Madrid?"

**Entregable**: Agente completo con weather integrada, funcionando con al menos 3 preguntas distintas.

---

### Fase 5: Documentación

**Objetivo**: Actualizar documentación del proyecto e instrucciones de uso.

**Tareas**:
- [ ] 5.1 Actualizar `README.md`:
  - Agregrar sección sobre la herramienta weather
  - Incluir instrucciones de instalación de API Key
  - Listar ejemplos de preguntas soportadas
- [ ] 5.2 Actualizar `docs/guardrails.md`:
  - Agregar sección sobre herramienta weather
  - Criterios de uso (cuándo invocarla)
  - Ejemplos de preguntas válidas e inválidas
  - Consideraciones de privacidad
  - Manejo de errores esperados
  - Limitaciones (requiere ciudad explícita, cubre solo clima actual/día)
- [ ] 5.3 Crear o actualizar `.env.example`:
  - Incluir `WEATHER_API_KEY=your_key_here`
  - Documentar formato esperado
- [ ] 5.4 Actualizar `docs/architecture.md` si existe:
  - Diagrama o descripción de nueva herramienta
  - Flujo de datos
- [ ] 5.5 Actualizar `CHANGELOG.md`:
  - Agregar entrada con versión y cambios realizados

**Entregable**: Documentación completa y actualizada.

---

### Fase 6: Validación y QA

**Objetivo**: Asegurar que todos los requisitos se cumplen y nada se rompió.

**Tareas**:
- [ ] 6.1 Ejecutar suite de tests completa:
  - `tests/calculator.test.ts` (debe pasar)
  - `tests/currentTime.test.ts` (debe pasar)
  - `tests/weather.test.ts` (debe pasar)
  - `tests/runAgent.test.ts` (debe pasar)
- [ ] 6.2 Validar Definition of Done:
  - ✓ Herramienta weather implementada en TypeScript
  - ✓ Consume WeatherAPI.com correctamente
  - ✓ Tests unitarios creados y pasando
  - ✓ Prompt del agente actualizado
  - ✓ guardrails.md actualizado
  - ✓ Variables de entorno documentadas
  - ✓ Agente responde 3+ preguntas sobre clima
  - ✓ Respuesta ≤ 500 caracteres
  - ✓ No se rompió funcionalidad existente
  - ✓ Código claro y pedagógico
- [ ] 6.3 Revisar manejo de errores:
  - Probar con ciudad inexistente
  - Probar con API Key inválida
  - Probar con conexión lenta/ausente
- [ ] 6.4 Revisar limpieza de código:
  - Sin console.log de debug
  - Nombres de variables claros
  - Comentarios útiles pero no excesivos
  - Sin código comentado innecesario
- [ ] 6.5 Commit final a git (si aplica)

**Entregable**: Validación completa, proyecto listo para producción/entrega.

---

## 3. Orden de Ejecución Recomendado

1. **Primero**: Fase 1 (Preparación) - Establece cimientos
2. **Segundo**: Fase 2 (Herramienta) - Desarrollo principal
3. **Tercero**: Fase 3 (Tests) - Validación de la herramienta individual
4. **Cuarto**: Fase 4 (Integración) - Integración en agente
5. **Quinto**: Fase 5 (Documentación) - Registro de cambios
6. **Sexto**: Fase 6 (QA) - Validación final

**Razón**: Construcción de abajo hacia arriba, probando en cada paso.

---

## 4. Criterios de Éxito por Fase

| Fase | Criterio | Cómo Verificar |
|------|----------|----------------|
| 1 | API Key configurada | Variable de entorno accesible y validada |
| 2 | Herramienta funciona | Puede invocar weather.invoke({city: "Santiago"}) sin errores |
| 3 | Tests pasan | `npm run test weather.test.ts` sin fallos |
| 4 | Agente integrado | `npm run dev` y el agente responde preguntas sobre clima |
| 5 | Formato documentado | README y guardrails.md actualizados y claros |
| 6 | Todo valida | Todos los tests pasan, no hay funcionalidad rota |

---

## 5. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|--------|-----------|
| API Key inválida | Bloquea desarrollo | Validar en Fase 1, usar cuenta de prueba |
| Cambios en estructura de WeatherAPI | Respuesta incorrecta | Revisar docs de API, implementar manejo de versiones |
| Integración rompe agente existente | Regresión | Mantener tests de otras herramientas en cada paso |
| Respuesta excede 500 caracteres | Incumple requisito | Implementar truncamiento + test de límite |
| Errores no controlados | Agente falla | Implementar try/catch robusto, casos edge en tests |

---

## 6. Artefactos a Crear/Modificar

### Archivos a Crear:
- `src/tools/weather.ts` - Herramienta principal
- `tests/weather.test.ts` - Suite de tests

### Archivos a Modificar:
- `src/config/env.ts` - Agregar WEATHER_API_KEY
- `src/agent/createAgent.ts` - Registrar herramienta
- `src/agent/prompt.ts` - Actualizar instrucciones
- `docs/guardrails.md` - Documentar nueva herramienta
- `README.md` - Instrucciones de setup
- `.env.example` - Variable de entorno
- `CHANGELOG.md` - Registro de cambios
- `docs/architecture.md` - Actualizar (opcional)

---

## 7. Notas de Implementación

### Patrón a Seguir
La herramienta debe seguir el mismo patrón que `calculator.ts` y `currentTime.ts`:
- Implementar como `RunnableInterface<Input, Output>`
- Exportar función que retorna la instancia
- Incluir tipos TypeScript completos
- Pasar interfaz clara a LangChain

### Límite de Caracteres
El truncamiento debe ser inteligente:
- Preservar información esencial (temperatura, lluvia, recomendación)
- No cortar palabras a mitad
- Usar elipsis (...) si se trunca

### Recomendaciones de Vestuario
Implementar lógica combinada:
```
clothing_advice = [descripción base] + [ajustes térmicos] + [protecciones]
```
Ejemplo: "Día cálido con sol fuerte. Usa protector solar SPF50+. Ligero, sin abrigo."

### Manejo de Errores
Retornar estructura consistente incluso en error:
```json
{
  "error": "Ciudad no encontrada: 'Xxx'",
  "suggestion": "Intenta con 'Ciudad, País'"
}
```

---

## 8. Checklist Final

- [ ] Todos los archivos creados/modificados según plan
- [ ] Todos los tests pasan
- [ ] Agente responde correctamente preguntas sobre clima
- [ ] Documentación actualizada
- [ ] No se rompió funcionalidad existente
- [ ] Código revisado y limpio
- [ ] Listo para commit/entrega
