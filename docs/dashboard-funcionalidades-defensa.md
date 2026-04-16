# Dashboard SOC - Guía de defensa (explicación simple)

## Objetivo del dashboard
Este dashboard no es solo para "ver tablas". Sirve para ejecutar el ciclo SOC completo:

1. Detectar señales.
2. Priorizar qué atacar primero.
3. Investigar con contexto.
4. Gestionar casos/incidentes.
5. Cerrar alertas con clasificación.
6. Medir rendimiento operativo (KPI).

## Recorrido visual (de arriba a abajo, como se ve en pantalla)

### 1) Filtros globales (Companies + rango fechas + Refresh)
Qué hace:
- Define el alcance del análisis (empresa/s y periodo).

Por qué importa:
- Permite pasar de investigación local (una empresa) a visión transversal (todas).

Ejemplo:
- `All Companies` + última semana para detectar campañas compartidas.

### 2) Saved Work Filters
Qué hace:
- Guarda y recupera configuraciones de filtros.

Por qué importa:
- Evita repetir tareas manuales en cada turno.

Ejemplo:
- Preset "Morning triage": abiertas + críticas + 24h.

### 3) Tarjetas resumen (Total Logs, Total Alerts, Open Alerts, Critical Logs)
Qué hace:
- Da una foto rápida del estado de seguridad.

Por qué importa:
- Permite detectar picos o saturación en segundos.

Ejemplo:
- Si `Open Alerts` sube mucho, hay acumulación/backlog.

### 4) SOC Operational Metrics
Qué hace:
- Muestra métricas operativas: backlog, open rate, critical open, MTTD, MTTR, total.

Por qué importa:
- Convierte la operación SOC en indicadores medibles.

Ejemplo:
- Si MTTR baja tras introducir acciones masivas, se demuestra mejora real.

### 5) Log Levels
Qué hace:
- Distribución de logs por severidad (INFO, WARNING, CRITICAL).

Por qué importa:
- Da contexto del "ruido" y de la criticidad del periodo.

Ejemplo:
- Subida de CRITICAL implica priorizar revisión/correlación.

### 6) Cross-Company Campaigns
Qué hace:
- Detecta indicadores compartidos entre varias empresas.
- Muestra severidad, afectadas, abiertas/cerradas, último evento, empresas impactadas.

Por qué importa:
- Identifica campañas transversales multi-tenant.

Ejemplo:
- Mismo indicador ransomware en 2 empresas => incidente de alta prioridad.

### 7) SLA & Aging (Open Alerts)
Qué hace:
- Calcula antigüedad de alertas abiertas y las compara contra SLA por severidad.
- Lista alertas incumplidas.

Por qué importa:
- Evita deuda operativa y asegura tiempos de respuesta.

Ejemplo:
- Alerta CRITICAL con edad 2700 min y SLA 60 min => escalado inmediato.

### 8) Case Management
Qué hace:
- Permite crear casos desde alertas seleccionadas.
- Gestiona owner, estado y trazabilidad del caso.

Por qué importa:
- Pasa de alertas sueltas a gestión formal de incidente.

Ejemplo:
- Caso "Phishing April Campaign" con varias alertas relacionadas.

### 9) Log Details (plegable)
Qué hace:
- Filtros avanzados en logs (nivel, fuente, tipo, IP, texto, franja horaria, con/sin alerta).
- Pivots desde tabla para acelerar investigación.

Por qué importa:
- Da evidencia técnica rápida sin salir del dashboard.

Ejemplo:
- Pivot por IP desde alerta y revisar secuencia temporal completa.

### 10) Alerts (plegable principal)
Qué hace:
- Vista de trabajo SOC de alertas con:
  - `Risk Score` (priorización),
  - estado + owner (workflow),
  - investigación 360,
  - cierre con clasificación (`TRUE_POSITIVE`, `FALSE_POSITIVE`, `BENIGN`) y nota,
  - agrupación y acciones masivas.

Por qué importa:
- Unifica triage, investigación, decisión y cierre en un único flujo operativo.

Ejemplo:
- Seleccionar grupo correlado, investigar una muestra, aplicar cierre masivo clasificado.

## Explicación simple de las 10 funcionalidades implementadas

1. **Risk Priority Queue**
- Ordena alertas por riesgo calculado (severidad + estado + alcance + frescura).

2. **Workflow + Ownership**
- Cada alerta tiene estado operativo y analista responsable.

3. **Alert 360 View**
- Investigación contextual con logs y alertas relacionadas.

4. **Pivots + Saved Filters**
- Saltos rápidos de investigación y presets reutilizables.

5. **Closure Classification + Feedback**
- Cierre con tipo de resolución y nota de aprendizaje.

6. **Alert Grouping + Bulk Actions**
- Deduplicación por correlación y acciones masivas para reducir ruido.

7. **Case Management Dashboard**
- Creación y seguimiento de casos desde alertas seleccionadas.

8. **Cross-Company Campaign Panel**
- Correlación multiempresa para detectar campañas compartidas.

9. **SLA & Aging Tracking**
- Control de alertas envejecidas y violaciones de SLA.

10. **SOC Operational Metrics**
- KPI de rendimiento: backlog, MTTD, MTTR, critical open, etc.

## Mensaje final para defensa
El valor del dashboard es operacional: reduce tiempo de análisis, baja ruido, mejora priorización y deja trazabilidad completa de la gestión SOC, desde la detección hasta el cierre y la medición del rendimiento.
