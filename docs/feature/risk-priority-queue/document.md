# document.md

## Què he fet

He implementat una cua de triatge d'alertes prioritzada per risc dins del dashboard. Ara cada alerta mostra un `riskScore` (0-100) i el panell d'alertes permet ordenar per:

- major risc
- més noves
- més antigues

També he afegit una columna nova `Risk Score` a la taula d'alertes.

## Per què ho he fet

Amb l'estat anterior, les alertes es visualitzaven principalment per data i això no ajudava a atacar primer el risc més alt. Aquesta millora redueix temps de triatge perquè prioritza automàticament les alertes amb més impacte potencial.

## Com ho he fet

1. He afegit una funció de càlcul de risc al `useDashboardViewModel`.
2. El càlcul combina:
   - severitat (`CRITICAL`, `WARNING`, `INFO`)
   - estat (`OPEN` suma més risc)
   - si afecta múltiples empreses
   - recència (bonus si és una alerta recent)
3. He afegit un estat nou `alertSortMode` al viewmodel i una ordenació final de la llista d'alertes.
4. He exposat el selector de mode d'ordenació a `DashboardView`.
5. He actualitzat `AlertsTable` per mostrar la columna `Risk Score`.

## Resultat funcional

L'analista SOC pot veure i atacar primer les alertes de més risc sense canviar de pantalla ni fer filtratge manual extra.
