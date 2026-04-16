# document.md

## Què he fet

He implementat un workflow operatiu d'alertes amb estats SOC i assignació de propietari (`owner`) des del dashboard.

Ara una alerta pot tenir estats:

- OPEN
- ACKNOWLEDGED
- IN_PROGRESS
- ESCALATED
- RESOLVED
- FALSE_POSITIVE
- CLOSED

També es pot assignar o canviar el responsable directament a la taula d'alertes.

## Per què ho he fet

Amb només `OPEN/CLOSED`, el flux de triatge no era traçable i era difícil saber qui porta cada alerta. Amb workflow + ownership puc controlar millor el backlog i reduir pèrdues de context entre analistes.

## Com ho he fet

1. He ampliat el model `Alert` amb camp `owner` i actualització de `statusUpdatedAt`.
2. He ampliat `AlertStatus` amb estats operatius SOC.
3. He creat el DTO `UpdateAlertWorkflowRequest`.
4. He afegit endpoint nou `PATCH /api/alerts/{alertId}/workflow`.
5. He implementat la lògica a `AlertService.updateAlertWorkflow(...)`.
6. He retornat `owner` i `statusUpdatedAt` al `AlertResponse`.
7. Al frontend he afegit:
   - servei `alertService.updateWorkflow(...)`
   - acció `updateAlertWorkflow` al `useDashboardViewModel`
   - controls inline a `AlertsTable` per canviar estat i propietari.

## Resultat funcional

L'analista SOC pot gestionar el cicle de vida real de cada alerta i deixar-ne propietari sense sortir del dashboard.
