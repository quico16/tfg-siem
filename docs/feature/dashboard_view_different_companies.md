# Branch Notes: feature/dashboard_view_different_companies

## Functional Goal

Enable a multi-company dashboard view with two key capabilities:

- See aggregated alerts across the selected scope
- Filter by affected companies and identify alerts shared across multiple companies

## Final Design Decision

### Company selector

- Single selection at the top:
  - `All Companies`
  - Each available company
- Direct multi-select on the main selector was removed to simplify UX.

### Affected companies filter block (only in `All Companies` mode)

A dedicated panel is shown with two levels:

1. Filter mode:
- `Show all alerts` (default)
- `Filter by selected companies`

2. View mode (when filtering by selected companies):
- `Show all alerts for selected companies`
- `Show only alerts shared by all selected companies`

In shared mode, only alerts that exist in all selected companies are displayed.

## Shared Alert Correlation

To detect equivalent alerts across companies:

- Normalize the alert message (remove prefixes and formatting variance)
- Build a correlation key: `severity + normalized message`
- Calculate how many companies contain that key

No `correlation_key` database field was added in this iteration; correlation is computed in the frontend with available data.

## UI Improvements

In the alerts table:

- `Date` is displayed at seconds precision (without milliseconds)
- New columns:
  - `Type`: `Shared (X/Y)` or `Unique (X/Y)`
  - `Affected Companies`: list of company names where the same pattern appears

This replaces the previous `GRP-xxx` approach.

## Important Behavior in Single-Company Mode

When a single company is selected:

- The table shows alerts from that company
- `Type` and `Affected Companies` are still computed using global context (all companies), so cross-company risk is not hidden

## Test Data Scripts

New seed scripts were added for multi-company validation:

- `seed-data-third-company.ps1`
  - Creates `Demo Company 3` with sources and logs

- `seed-data-three-company-combinations.ps1`
  - Injects cross-company log/alert combinations among:
    - `Demo Company`
    - `Demo Company 2`
    - `Demo Company 3`
  - Includes shared and unique scenarios

## Validations Executed During the Branch

- `npm run lint` (frontend)
- `npm run build` (frontend)
- `mvn test` (backend)
- Execution of new seed scripts

## Technical Notes

- `Company`, `Log`, and `Alert` IDs are database-generated (`IDENTITY`)
- IDs are usually incremental but may include gaps (rollback, failed transactions, etc.)
