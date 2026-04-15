# document.md

## Què he fet

He afegit classificació funcional de tancament d'alertes:

- `TRUE_POSITIVE`
- `FALSE_POSITIVE`
- `BENIGN`

També he afegit una nota opcional de tancament.

Al dashboard, quan tanco una alerta, puc triar classificació i escriure context abans de confirmar.

## Per què ho he fet

Sense classificació de tancament no hi havia feedback operatiu per saber quines regles generen soroll i quines alertes són realment útils. Aquesta informació és clau per reduir falsos positius.

## Com ho he fet

1. He creat `AlertResolutionType` al backend.
2. He ampliat `Alert` amb:
   - `resolutionType`
   - `resolutionNote`
3. He ampliat `AlertResponse` amb aquests camps.
4. He creat `CloseAlertRequest` per enviar classificació i nota al tancament.
5. He modificat `PATCH /api/alerts/{id}/close` per acceptar payload opcional.
6. He adaptat `AlertService.closeAlert(...)` per guardar classificació i nota.
7. Al frontend he modificat:
   - `alertService.closeAlert(alertId, payload)`
   - `useDashboardViewModel.closeAlert`
   - `AlertsTable` amb selector de classificació i nota.

## Resultat funcional

Ara cada alerta tancada deixa traç de qualitat (TP/FP/BENIGN) i context de tancament per millorar tuning de deteccions.
