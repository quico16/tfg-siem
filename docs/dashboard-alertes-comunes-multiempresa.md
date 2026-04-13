# Documentacio addicional: Alertes comunes entre empreses seleccionades

## Context
Despres d'afegir la multiseleccio d'empreses al dashboard, s'ha afegit una segona capa d'analisi:

- veure les alertes agregades de les empreses seleccionades
- veure quines alertes son comunes entre aquestes empreses

Aixo permet diferenciar entre "tot el que passa" i "el que es transversal".

## Com queda el dashboard final

El dashboard queda dividit en dos blocs d'alertes:

1. **Alertes agregades**
- taula tradicional amb totes les alertes de les empreses seleccionades
- inclou columna `Empresa` per saber l'origen de cada alerta
- manté filtre d'estat (`ALL`, `OPEN`, `CLOSED`)

2. **Alertes comunes**
- nova taula amb agrupacio d'alertes compartides
- nou selector de mode:
  - `Alertes comunes a totes les empreses seleccionades`
  - `Alertes comunes en almenys X empreses`
- si es tria mode `X`, es mostra input numeric per definir el llindar

## Decisions de disseny

### Per que no s'ha canviat la base de dades
No s'ha fet migracio de DB en aquesta iteracio per reduir risc i mantenir compatibilitat.

En lloc d'aixo, s'ha implementat correlacio al backend a partir de dades existents:

- es recuperen alertes de les empreses seleccionades
- es normalitza el missatge
- es crea una clau de correlacio `severity + normalizedMessage`
- es calcula en quantes empreses apareix cada clau

### Avantatges
- implementacio rapida i funcional
- no trenca APIs existents
- facilita iterar en una futura versio amb `correlation_key` persistida

### Limitacio coneguda
Com que la correlacio es basa en text normalitzat, pot haver-hi casos on dues alertes similars no es detectin com a iguals (o a l'inreves) si el missatge canvia massa.

## Canvis backend

### Endpoint nou
**GET** `/api/alerts/cross-company`

Params:
- `companyIds` (llista separada per comes)
- `minAffectedCompanies` (enter, per defecte 2)

Resposta:
- severitat i missatge base
- empreses afectades / empreses seleccionades
- noms d'empreses afectades
- comptadors d'obertes i tancades
- ultima deteccio

### Fitxers modificats backend
- `backend/src/main/java/com/tfg/siem/controller/AlertController.java`
- `backend/src/main/java/com/tfg/siem/service/AlertService.java`
- `backend/src/main/java/com/tfg/siem/repository/AlertRepository.java`
- `backend/src/main/java/com/tfg/siem/dto/CrossCompanyAlertResponse.java` (nou)

## Canvis frontend

### Integracio de servei
- Nou metode `getCrossCompany(companyIds, minAffectedCompanies)` a `alertService`

### ViewModel del dashboard
- nous estats:
  - `commonAlerts`
  - `commonAlertsMode` (`ALL_SELECTED` o `AT_LEAST_X`)
  - `minAffectedCompanies`
  - `effectiveMinAffectedCompanies`
- carrega conjunta de:
  - dades agregades per empresa (summary, levels, alerts)
  - alertes comunes via endpoint nou

### Components i vista
- nova taula `CommonAlertsTable.jsx`
- `DashboardView.jsx` actualitzat amb controls de mode/llindar i segona seccio de resultats

### Fitxers modificats frontend
- `frontend/src/services/alertService.js`
- `frontend/src/viewmodels/useDashboardViewModel.jsx`
- `frontend/src/views/DashboardView.jsx`
- `frontend/src/components/CommonAlertsTable.jsx` (nou)

## Validacio executada

S'ha verificat que el canvi funciona i compila correctament:

- `mvn test` (backend) -> OK
- `npm run lint` (frontend) -> OK
- `npm run build` (frontend) -> OK

## Proposta de millora futura (opcional)

Per augmentar precisio i escalabilitat:

- afegir `correlation_key` a la taula `alerts`
- generar aquesta clau al moment de crear l'alerta
- correlacionar per clau en lloc de text normalitzat

Aquesta millora reduiria falsos positius/negatius en entorns amb missatges variables.

