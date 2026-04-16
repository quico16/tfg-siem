# document.md

## Què he fet

He afegit una vista de **deduplicació operativa** d'alertes al dashboard:

- agrupació per clau de correlació
- recompte total i obert per grup
- acció massiva `Close open in group`

## Per què ho he fet

Quan hi ha moltes alertes repetides, el triatge manual fila a fila és lent i genera fatiga. Amb agrupació + bulk close puc reduir soroll operatiu i accelerar neteja de cua.

## Com ho he fet

1. He afegit a `useDashboardViewModel`:
   - `groupedAlerts` (agregació per correlació)
   - `bulkCloseAlerts(alertIds)` (tancament massiu)
2. He incorporat a `DashboardView` una taula nova `Grouped Alerts (Dedup View)`.
3. Cada grup mostra:
   - correlació
   - severitat
   - total
   - obertes
   - data més recent
4. L'acció `Close open in group` tanca totes les alertes obertes del grup.

## Resultat funcional

Ara puc gestionar alertes repetides com un bloc operatiu i reduir ràpidament volum de cues sorolloses.
