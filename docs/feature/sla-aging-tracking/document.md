# document.md

## Què he fet

He implementat seguiment funcional de **SLA i envelliment** d'alertes obertes al dashboard.

Ara es mostra:

- resum de backlog obert per franges d'edat (<1h, 1-4h, >4h)
- nombre d'alertes que incompleixen SLA
- taula de les alertes en breach (edat vs SLA)

## Per què ho he fet

Sense control d'envelliment, el SOC detecta tard quan la cua s'està degradant. Aquest panell permet prioritzar ràpidament alertes estancades i evitar acumulació crítica.

## Com ho he fet

1. A `useDashboardViewModel` he afegit:
   - càlcul d'edat en minuts
   - política de SLA per severitat (`CRITICAL=60`, `WARNING=240`, `INFO=720`)
   - `alertAgingSummary`
   - `slaBreachedAlerts`
2. A `DashboardView` he afegit un bloc `SLA & Aging (Open Alerts)` amb resum i taula de breach.

## Resultat funcional

Ara puc veure en temps real quines alertes obertes estan fora de SLA i actuar sobre les que més risc operatiu generen per retard.
