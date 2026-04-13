# Documentacio del canvi: seleccio de multiples empreses al dashboard

## Objectiu
S'ha modificat el frontend per permetre:

- Seleccionar **totes les empreses** d'una sola vegada.
- Seleccionar un conjunt concret de **N empreses** (multiseleccio).
- Mostrar al dashboard les **alertes** i metriques de **logs** agregades de les empreses seleccionades.

Aquest canvi resol la limitacio anterior, on nomes es podia consultar una empresa cada cop.

## Canvis implementats

### 1. Selector d'empreses amb multiseleccio
**Fitxer:** `frontend/src/components/CompanySelector.jsx`

- S'ha substituit el `select` unic per una llista de `checkboxes`.
- S'ha afegit l'opcio **"Totes les empreses"**.
- El component ara treballa amb `selectedCompanyIds` (array de IDs) en lloc d'un unic `selectedCompanyId`.

**Per que?**
- El backend actual exposa endpoints per empresa (`/company/{id}`), aixi que al frontend ens cal poder construir un conjunt d'empreses actives per fer agregacio.
- Amb checkboxes, l'usuari te un control clar de quines empreses entren al filtre.

### 2. Adaptacio de la vista de dashboard
**Fitxer:** `frontend/src/views/DashboardView.jsx`

- S'ha connectat el nou selector amb `selectedCompanyIds` i `setSelectedCompanyIds`.

**Per que?**
- La vista havia de consumir el nou contracte del component de seleccio multiple.

### 3. Agregacio de dades al ViewModel
**Fitxer:** `frontend/src/viewmodels/useDashboardViewModel.jsx`

Canvis principals:

- Estat canviat de `selectedCompanyId` a `selectedCompanyIds`.
- Carrega inicial: si no hi ha cap empresa seleccionada, se selecciona la primera per defecte.
- Carrega de dades:
  - Es fan crides en paral·lel per cada empresa seleccionada:
    - `dashboardService.getSummary(companyId)`
    - `dashboardService.getLevels(companyId)`
    - `alertService.getAll(companyId)`
  - Es combinen resultats:
    - `summary`: suma de metriques (`totalLogs`, `totalAlerts`, `openAlerts`, `criticalLogs`, `totalSources`).
    - `levels`: agregacio per nivell (`INFO`, `WARNING`, `CRITICAL`, etc.).
    - `alerts`: concatenacio i ordenacio per data descendent.
- Si no hi ha empreses seleccionades, es netegen `summary`, `levels` i `alerts`.

**Per que?**
- El backend no te endpoint "multi-company" ni "all companies" per dashboard/alertes; per tant, la manera segura i compatible de suportar-ho era agregar al frontend mantenint els endpoints existents.

### 4. Taula d'alertes amb columna d'empresa
**Fitxer:** `frontend/src/components/AlertsTable.jsx`

- S'ha afegit la columna **Empresa** (`alert.companyName`).

**Per que?**
- Quan es mostren alertes de diverses empreses, cal identificar visualment l'origen de cada alerta.

### 5. Ajust menor per validacio
**Fitxer:** `frontend/src/views/AlertsView.jsx`

- S'han eliminat imports no utilitzats que feien fallar `eslint`.

**Per que?**
- Necessari per deixar la branca en estat valid (`lint` verd) i evitar soroll de qualitat no relacionat directament amb la funcionalitat.

## Validacio realitzada

Despres dels canvis s'han executat:

- `npm run lint` (frontend) -> correcte
- `npm run build` (frontend) -> correcte

## Resultat funcional

Amb la nova implementacio, l'usuari pot:

- Marcar **Totes les empreses** i veure una visio global.
- Marcar un subconjunt d'empreses i veure nomes les dades rellevants d'aquest subconjunt.
- Continuar tancant alertes des de la taula sense trencar el flux existent.

## Impacte tecnic

- No s'ha modificat el backend ni contractes d'API.
- El canvi es concentra al frontend i es compatible amb els endpoints actuals.
- L'agregacio al client evita regressions i redueix risc d'introduir canvis API en aquesta entrega.

