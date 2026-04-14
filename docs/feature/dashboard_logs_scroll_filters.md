# Documentacio de branca: feature/logs-scroll-filters

## Objectiu funcional
Millorar el dashboard per passar d'un resum de logs a una vista operativa:

- llistat de logs consultable en scroll
- filtres utiles per analisi rapida
- mantenir coherencia amb l'empresa (o empreses) seleccionada/es

## Decisions preses i motiu

### 1) Panell de logs scrolleable al dashboard
**Decisio:** afegir un bloc `Detall de logs` amb taula i contenidor amb scroll vertical.
**Perque:** evita carregar tota la pagina quan hi ha volum i permet revisar historic recent sense trencar el layout.

### 2) Carga de logs per empresa + rang de dates
**Decisio:** carregar logs amb `logService.getAll(companyId, startDate, endDate)` per cada empresa en scope.
**Perque:** reutilitza l'API existent i manté el panell sincronitzat amb el selector d'empresa i el filtre temporal ja presents.

### 3) Filtres implementats
**Decisio:** mantenir aquests filtres actius:
- nivell (`INFO`, `WARNING`, `CRITICAL`)
- origen (`sourceName`)
- tipus d'origen (`sourceType`)
- IP (coincidencia parcial)
- cerca lliure en text (missatge, empresa, origen, nivell, IP)
- alerta associada (`tots`, `nomes amb alerta`, `nomes sense alerta`)
- rang d'hora (`hora inici` / `hora fi`, incloent rangs que creuen mitjanit)

**Perque:** cobreixen els casos mes habituals de triatge SOC: severitat, context tecnic, focus en IP, relacio amb alertes i patrons per franja horaria.

### 4) Eliminacio del filtre de pais IP
**Decisio:** retirar completament el filtre i la columna de `pais`.
**Perque:** en les dades actuals el valor resultava `UNKNOWN` de forma sistematica, aportant soroll i poca utilitat operativa.

### 5) Eliminacio del filtre con/sin raw
**Decisio:** retirar el filtre de `raw` pero mantenir la columna `Raw log`.
**Perque:** tots els logs actuals ja porten `raw`, aixi que el filtre no separava cap conjunt util; la columna si segueix sent valuosa per inspeccio puntual.

### 6) Columna `Raw log` expandible
**Decisio:** mantenir `details/summary` per obrir `rawLog` JSON per fila.
**Perque:** equilibra usabilitat i densitat d'informacio, evitant saturar la taula.

## Fitxers modificats en aquesta iteracio
- `frontend/src/viewmodels/useDashboardViewModel.jsx`
- `frontend/src/views/DashboardView.jsx`
- `frontend/src/components/LogsTable.jsx`
- `frontend/src/index.css`

## Validacio executada
- `npm run build` (frontend): OK

## Estat final de la funcionalitat
- panell de logs scrolleable operatiu
- filtres actius i coherents amb les dades reals disponibles
- neteja de filtres no utiles (`pais`, `raw presence`)
