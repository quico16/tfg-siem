# Documentació de branca: feature/dashboard_view_different_companies

## Objectiu funcional

Permetre una vista de dashboard multiempresa amb dues necessitats clau:

- Veure alertes agregades dins l'àmbit seleccionat
- Filtrar per empreses afectades i distingir alertes compartides entre empreses

## Decisió de disseny final

### Selector d'empreses

- Selecció única al capdamunt:
  - `Totes les empreses`
  - Cadascuna de les empreses disponibles
- Es va eliminar la multiselecció directa del selector principal per simplificar la UX.

### Bloc de filtre d'empreses afectades (només en mode `Totes les empreses`)

S'afegeix un bloc amb dos nivells:

1. Mode de filtre:
- `Mostrar totes les alertes` (per defecte)
- `Filtrar per empreses seleccionades`

2. Mode de visualització (quan s'activa filtre per empreses):
- `Veure totes les alertes de les empreses seleccionades`
- `Veure només alertes comunes a totes les empreses seleccionades`

En mode comú, només es mostren alertes presents a totes les empreses marcades.

## Correlació d'alertes compartides

Per identificar si una alerta és equivalent entre empreses:

- Es normalitza el missatge
- Es construeix una clau: `severitat + missatge normalitzat`
- Es calcula en quantes empreses apareix la clau

No s'ha afegit cap camp `correlation_key` a base de dades en aquesta iteració; la correlació es calcula al frontend.

## Millora visual aplicada

A la taula d'alertes:

- `Data` es mostra amb precisió de segons (sense mil·lisegons)
- S'afegeixen columnes:
  - `Tipus`: `Compartida (X/Y)` o `Única (X/Y)`
  - `Empreses afectades`: llista de noms d'empreses on apareix el mateix patró

Això substitueix l'enfoc anterior basat en `GRP-xxx`.

## Comportament important en empresa única

Quan selecciones una sola empresa:

- La taula mostra les alertes d'aquella empresa
- Però `Tipus` i `Empreses afectades` es calculen amb context global per no ocultar risc transversal

## Dades de prova creades

S'han afegit scripts de seed per validar escenaris multiempresa:

- `seed-data-third-company.ps1`
  - Crea `Demo Company 3` amb fonts i logs

- `seed-data-three-company-combinations.ps1`
  - Injecta combinacions de logs/alertes entre:
    - `Demo Company`
    - `Demo Company 2`
    - `Demo Company 3`
  - Inclou casos compartits i únics

## Validacions executades durant la branca

- `npm run lint` (frontend)
- `npm run build` (frontend)
- `mvn test` (backend)
- Execució dels nous scripts de seed

## Notes tècniques

- Els IDs de `Company`, `Log` i `Alert` són autogenerats per base de dades (`IDENTITY`)
- Normalment són incrementals, però poden tenir salts (rollback, errors de transacció, etc.)
