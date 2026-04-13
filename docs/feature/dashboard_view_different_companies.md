# Documentacio de branca: feature/dashboard_view_different_companies

## Objectiu funcional
Permetre una vista de dashboard multiempresa amb dues necessitats clau:

- veure alertes agregades (tot el que passa a l'ambit seleccionat)
- poder filtrar per empreses afectades i distingir quan una alerta es compartida entre empreses

## Decisio de disseny final

### Selector d'empreses
- Seleccio unica al capdamunt:
  - `Totes les empreses`
  - cadascuna de les empreses disponibles
- Es va eliminar el model de multiseleccio directa al selector principal per simplificar UX.

### Bloc de filtre d'empreses afectades (nomes en mode `Totes les empreses`)
S'afegeix un recuadre amb dos nivells:

1. Mode de filtre:
- `Mostrar totes les alertes` (default)
- `Filtrar per empreses seleccionades`

2. Mode de visualitzacio (quan hi ha filtre per empreses):
- `Veure totes les alertes de les empreses seleccionades`
- `Veure nomes alertes comunes a totes les empreses seleccionades`

Quan es tria mode comu, la llista mostra nomes alertes que apareixen en totes les empreses marcades.

## Correlacio d'alertes compartides
Per identificar si una alerta es la mateixa entre empreses:

- es normalitza el missatge (treient prefixos i variacions de format)
- es construeix una clau de correlacio: `severitat + missatge normalitzat`
- es calcula en quantes empreses apareix la clau

No s'ha afegit `correlation_key` a base de dades en aquesta iteracio; la correlacio es calcula al frontend amb les dades disponibles.

## Millora visual aplicada
A la taula d'alertes:

- `Fecha` es mostra a segons (sense milisegons)
- s'afegeixen columnes:
  - `Tipus`: `Compartida (X/Y)` o `Unica (X/Y)`
  - `Empreses afectades`: llista de noms d'empreses on apareix el mateix patro

Aixo substitueix la solucio anterior basada en `GRP-xxx`.

## Comportament important en empresa unica
Quan selecciones una sola empresa:

- la taula mostra les alertes d'aquella empresa
- pero `Tipus` i `Empreses afectades` es calculen amb context global (totes les empreses), per no ocultar risc transversal

## Dades de prova creades
S'han afegit scripts de seed per validar escenaris multiempresa:

- `seed-data-third-company.ps1`
  - crea `Empresa Demo 3` amb fonts i logs

- `seed-data-three-company-combinations.ps1`
  - injecta combinacions de logs/alertes entre:
    - Empresa Demo
    - Empresa Demo 2
    - Empresa Demo 3
  - inclou casos compartits (2/3, 3/3) i unics

## Validacions executades durant la branca
- `npm run lint` (frontend)
- `npm run build` (frontend)
- `mvn test` (backend)
- execucio dels scripts de seed nous

## Notes tecniques
- IDs de `Company`, `Log` i `Alert`: auto-generats per base de dades (`IDENTITY`)
- no son random; acostumen a ser incrementals, pero poden tenir salts (rollback, errors, etc.)
