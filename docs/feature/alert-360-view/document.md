# document.md

## Què he fet

He creat una vista d'investigació **Alert 360** dins del dashboard, integrada a la taula d'alertes amb el botó `Investigate`.

Quan obro una alerta, apareix un modal amb:

- context complet de l'alerta (companyia, severitat, estat, regla, correlació)
- timeline d'evidència relacionada
- logs relacionats
- alertes relacionades

## Per què ho he fet

L'analista SOC necessitava investigar una alerta sense saltar entre múltiples pantalles ni perdre context. Aquest canvi redueix el temps d'investigació i facilita el triatge amb evidència centralitzada.

## Com ho he fet

1. He creat el component `AlertInvestigationModal`.
2. He actualitzat `AlertsTable` per:
   - obrir el modal des de cada alerta (`Investigate`)
   - calcular logs relacionats (per `logId`, empresa i similitud de missatge)
   - calcular alertes relacionades (per `correlationKey`, `ruleKey` i similitud de missatge)
3. He connectat `DashboardView` per passar `filteredLogs` a la taula d'alertes.

## Resultat funcional

Ara puc fer una investigació 360 d'una alerta en una sola vista, amb timeline de context i evidència relacionada.
