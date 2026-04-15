# document.md

## Què he fet

He afegit un panell funcional de **campanyes multiempresa** al dashboard que consumeix l'endpoint backend de correlació transversal.

El panell mostra per indicador compartit:

- severitat
- indicador
- empreses afectades / seleccionades
- alertes obertes i tancades
- darrera detecció
- noms d'empreses afectades

## Per què ho he fet

Detectar patrons compartits entre empreses és clau per veure campanyes en curs i prioritzar resposta abans que escalin.

## Com ho he fet

1. He ampliat `alertService` amb `getCrossCompany(companyIds, minAffectedCompanies)`.
2. A `useDashboardViewModel` he afegit estat `crossCompanyCampaigns`.
3. Durant `loadDashboardData`, quan hi ha més d'una empresa en scope, he cridat l'endpoint `/alerts/cross-company`.
4. He renderitzat el panell `Cross-Company Campaigns` a `DashboardView`.

## Resultat funcional

Ara puc veure directament des del dashboard quins indicadors s'estan repetint entre empreses i quina és la seva càrrega operativa.
