# Branch Notes: feature/logs-scroll-filters

## Functional Goal

Improve the dashboard from a summary-only logs area to an operational log analysis panel:

- Scrollable log list
- Practical filters for fast triage
- Consistency with selected company scope and date range

## Decisions and Rationale

### 1) Scrollable logs panel in dashboard
Decision: Add a `Log Details` section with a table inside a vertical scroll container.  
Why: Prevents page overflow and allows analysts to review recent history without breaking layout.

### 2) Load logs by company + date range
Decision: Use `logService.getAll(companyId, startDate, endDate)` for each company in scope.  
Why: Reuses existing API and keeps panel data synchronized with selected company and date filter.

### 3) Implemented filters
Decision: Keep these active filters:

- Level (`INFO`, `WARNING`, `CRITICAL`)
- Source (`sourceName`)
- Source type (`sourceType`)
- IP (partial match)
- Free text search (`message`, `company`, `source`, `level`, `IP`)
- Linked alert (`all`, `only with linked alert`, `only without linked alert`)
- Hour range (`start hour` / `end hour`, including ranges crossing midnight)

Why: These cover common SOC triage workflows: severity, technical context, IP focus, alert linkage, and time windows.

### 4) Removed IP country filter
Decision: Remove the `country` filter and column entirely.  
Why: Current data consistently returned `UNKNOWN`, adding noise with low operational value.

### 5) Removed has/raw filter
Decision: Remove the `raw presence` filter but keep the `Raw log` column.  
Why: All current logs include raw payload, so the filter did not separate useful sets.

### 6) Expandable raw log column
Decision: Keep `details/summary` to expand row-level `rawLog` JSON.  
Why: Preserves table density while keeping deep inspection available on demand.

## Files Updated in This Iteration

- `frontend/src/viewmodels/useDashboardViewModel.jsx`
- `frontend/src/views/DashboardView.jsx`
- `frontend/src/components/LogsTable.jsx`
- `frontend/src/index.css`

## Validation

- `npm run build` (frontend): OK

## Final Status

- Scrollable logs panel is operational
- Filters are active and aligned with current data quality
- Low-value filters removed (`country`, `raw presence`)
