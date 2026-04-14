# Documentació de branca: feature/logs-scroll-filters

## Objectiu funcional

Millorar el dashboard per passar d'un resum de logs a una vista operativa:

- Llistat de logs consultable amb scroll
- Filtres útils per anàlisi ràpida
- Coherència amb l'empresa (o empreses) seleccionada/es i el rang temporal

## Decisions preses i motiu

### 1) Panell de logs amb scroll al dashboard
Decisió: afegir un bloc `Detall de logs` amb taula dins d'un contenidor amb scroll vertical.  
Per què: evita trencar el layout quan hi ha molt volum i facilita revisar l'històric recent.

### 2) Càrrega de logs per empresa + rang de dates
Decisió: carregar logs amb `logService.getAll(companyId, startDate, endDate)` per cada empresa en scope.  
Per què: reutilitza l'API existent i manté el panell sincronitzat amb selector d'empresa i filtre temporal.

### 3) Filtres implementats
Decisió: mantenir aquests filtres actius:

- Nivell (`INFO`, `WARNING`, `CRITICAL`)
- Origen (`sourceName`)
- Tipus d'origen (`sourceType`)
- IP (coincidència parcial)
- Cerca lliure de text (`message`, `company`, `source`, `level`, `IP`)
- Alerta associada (`totes`, `només amb alerta`, `només sense alerta`)
- Rang d'hora (`hora inici` / `hora fi`, incloent rangs que creuen mitjanit)

Per què: cobreixen els casos habituals de triatge SOC.

### 4) Eliminació del filtre de país IP
Decisió: eliminar completament filtre i columna de `país`.  
Per què: amb les dades actuals retornava `UNKNOWN` de forma sistemàtica.

### 5) Eliminació del filtre amb/sense raw
Decisió: retirar aquest filtre, mantenint la columna `Raw log`.  
Per què: tots els logs actuals tenen `raw`, així que el filtre no aportava separació útil.

### 6) Columna `Raw log` expandible
Decisió: mantenir `details/summary` per obrir el JSON `rawLog` per fila.  
Per què: equilibra usabilitat i densitat d'informació.

## Fitxers modificats en aquesta iteració

- `frontend/src/viewmodels/useDashboardViewModel.jsx`
- `frontend/src/views/DashboardView.jsx`
- `frontend/src/components/LogsTable.jsx`
- `frontend/src/index.css`

## Validació executada

- `npm run build` (frontend): OK

## Estat final

- Panell de logs amb scroll operatiu
- Filtres actius i coherents amb les dades disponibles
- Neteja de filtres de poc valor (`país`, `raw presence`)
