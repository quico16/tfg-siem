# Documentacio de `feature/fixes_dashboard`

## Resum
Aquest canvi ajusta el dashboard per millorar usabilitat i traçabilitat de logs/alertes.
Tambe actualitza el seed per guardar un `rawLog` realment complet.

## Canvis de frontend

### 1) Filtres d'alertes dins la seccio d'alertes
- El filtre d'estat d'alertes (`ALL`, `OPEN`, `CLOSED`) ja no es global a dalt.
- Ara viu dins la seccio plegable d'alertes.
- El bloc "Affected Companies Filter" tambe queda dins la seccio d'alertes.

### 2) Seccions plegables (list folding)
- Les seccions de Logs i Alertes estan amagades inicialment.
- Es despleguen clicant tota la barra del titol (no amb boto separat).
- S'ha afegit suport de teclat (`Enter` i espai) per accessibilitat.

### 3) Raw log en modal
- A la taula de logs, la columna "Raw" mostra un boto `View raw`.
- En clicar, s'obre un popup modal centrat amb el JSON no normalitzat.
- El modal es pot tancar amb boto `Close`.

### 4) Filtre per hores d'alertes
- S'ha afegit filtre d'hores per alertes:
  - `Alert start hour`
  - `Alert end hour`
- Funciona amb rang normal i rang creuant mitjanit.

### 5) Dates inicials nomes per dies
- El filtre principal de data passa de `datetime-local` a `date`.
- A UI nomes es veuen dies.
- Les hores es filtren nomes a les seccions de logs i alertes.

### 6) Ajust de query de logs per cobrir tot el dia
- Tot i usar `date` al filtre, la consulta envia:
  - inici `T00:00:00`
  - final `T23:59:59`
- Aixi no es perden logs del mateix dia.

## Canvis de dades (seed)

### 7) `rawLog` complet al seed
S'ha actualitzat `seed-data-3-companies-100-logs.ps1` per enviar un `rawLog` ric, amb:
- timestamp
- company/source ids
- level
- message
- ip
- event
- generator
- vendorPayload
- ingestMetadata

Objectiu: que el "raw log" sigui realment no normalitzat i informatiu.

### 8) Regeneracio de dades
Per validar-ho:
- S'han esborrat `logs` i `alerts` de base de dades.
- S'ha relancat el seed.
- Resultat: 100 logs creats i alertes regenerades.

## Fitxers tocats
- `frontend/src/components/DateRangeFilter.jsx`
- `frontend/src/components/LogsTable.jsx`
- `frontend/src/index.css`
- `frontend/src/viewmodels/useDashboardViewModel.jsx`
- `frontend/src/views/DashboardView.jsx`
- `seed-data-3-companies-100-logs.ps1`

## Validacio
- `npm run build` (frontend) completat correctament.
- Comprovacio API: `rawLog` retorna camps complets, no nomes `event/generator`.
