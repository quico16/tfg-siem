import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel'
import CompanySelector from '../components/CompanySelector'
import DateRangeFilter from '../components/DateRangeFilter'
import StatCard from '../components/StatCard'
import AlertsTable from '../components/AlertsTable'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import LevelsChart from '../components/LevelsChart'
import LogsTable from '../components/LogsTable'

export default function DashboardView() {
  const vm = useDashboardViewModel()
  const hourOptions = Array.from({ length: 24 }, (_, hour) => String(hour))

  return (
    <div style={{ padding: '24px' }}>
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <CompanySelector
          companies={vm.companies || []}
          selectedCompanyId={vm.selectedCompanyId || ''}
          onChange={vm.setSelectedCompanyId}
        />

        <DateRangeFilter
          startDate={vm.startDate}
          endDate={vm.endDate}
          onStartDateChange={vm.setStartDate}
          onEndDateChange={vm.setEndDate}
        />

        <select
          value={vm.alertStatusFilter}
          onChange={(e) => vm.setAlertStatusFilter(e.target.value)}
        >
          <option value="ALL">Totes les alertes</option>
          <option value="OPEN">Només obertes</option>
          <option value="CLOSED">Només tancades</option>
        </select>

        <button onClick={vm.reload}>Refrescar</button>
      </div>

      {vm.isAllCompaniesSelected && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px',
            border: '1px solid #d5d5d5',
            borderRadius: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <strong>Filtre empreses afectades</strong>
            <select
              value={vm.affectedCompaniesFilterMode}
              onChange={(e) => vm.setAffectedCompaniesFilterMode(e.target.value)}
            >
              <option value="ALL_ALERTS">Mostrar totes les alertes</option>
              <option value="SELECT_COMPANIES">Filtrar per empreses seleccionades</option>
            </select>

            {vm.affectedCompaniesFilterMode === 'SELECT_COMPANIES' && (
              <select
                value={vm.affectedAlertsViewMode}
                onChange={(e) => vm.setAffectedAlertsViewMode(e.target.value)}
              >
                <option value="ANY_SELECTED">
                  Veure totes les alertes de les empreses seleccionades
                </option>
                <option value="COMMON_SELECTED">
                  Veure només alertes comunes a totes les empreses seleccionades
                </option>
              </select>
            )}
          </div>

          {vm.affectedCompaniesFilterMode === 'SELECT_COMPANIES' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '8px'
              }}
            >
              {vm.availableAlertCompanies.map((company) => (
                <label
                  key={company.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}
                >
                  <input
                    type="checkbox"
                    checked={vm.selectedAffectedCompanyIds.includes(company.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        vm.setSelectedAffectedCompanyIds([...vm.selectedAffectedCompanyIds, company.id])
                      } else {
                        vm.setSelectedAffectedCompanyIds(
                          vm.selectedAffectedCompanyIds.filter((id) => id !== company.id)
                        )
                      }
                    }}
                  />
                  {company.name}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {vm.loading && <LoadingSpinner />}
      {vm.error && <ErrorMessage message={vm.error} />}

      {vm.summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}
        >
          <StatCard title="Logs totals" value={vm.summary.totalLogs ?? 0} />
          <StatCard title="Alertes totals" value={vm.summary.totalAlerts ?? 0} />
          <StatCard title="Alertes obertes" value={vm.summary.openAlerts ?? 0} />
          <StatCard title="Logs crítics" value={vm.summary.criticalLogs ?? 0} />
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <LevelsChart
          levels={vm.levels || []}
          selectedLevel={vm.levelFilter}
          onLevelChange={vm.setLevelFilter}
        />
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Detall de logs</h3>

        <div className="logs-filters-grid">
          <select value={vm.logLevelFilter} onChange={(e) => vm.setLogLevelFilter(e.target.value)}>
            <option value="ALL">Nivell: tots</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <select value={vm.logSourceFilter} onChange={(e) => vm.setLogSourceFilter(e.target.value)}>
            <option value="ALL">Origen: tots</option>
            {vm.availableLogSources.map((sourceName) => (
              <option key={sourceName} value={sourceName}>
                {sourceName}
              </option>
            ))}
          </select>

          <select
            value={vm.logSourceTypeFilter}
            onChange={(e) => vm.setLogSourceTypeFilter(e.target.value)}
          >
            <option value="ALL">Tipus origen: tots</option>
            {vm.availableLogSourceTypes.map((sourceType) => (
              <option key={sourceType} value={sourceType}>
                {sourceType}
              </option>
            ))}
          </select>

          <select
            value={vm.logAlertLinkFilter}
            onChange={(e) => vm.setLogAlertLinkFilter(e.target.value)}
          >
            <option value="ALL">Alerta asociada: todos</option>
            <option value="WITH_ASSOCIATED_ALERT">Solo con alerta asociada</option>
            <option value="WITHOUT_ASSOCIATED_ALERT">Solo sin alerta asociada</option>
          </select>

          <div style={{ display: 'flex', gap: '6px' }}>
            <select
              value={vm.logHourStartFilter}
              onChange={(e) => vm.setLogHourStartFilter(e.target.value)}
            >
              <option value="ALL">Hora inicio</option>
              {hourOptions.map((hour) => (
                <option key={`start-${hour}`} value={hour}>
                  {hour.padStart(2, '0')}:00
                </option>
              ))}
            </select>
            <select value={vm.logHourEndFilter} onChange={(e) => vm.setLogHourEndFilter(e.target.value)}>
              <option value="ALL">Hora fin</option>
              {hourOptions.map((hour) => (
                <option key={`end-${hour}`} value={hour}>
                  {hour.padStart(2, '0')}:59
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="Filtrar per IP..."
            value={vm.logIpFilter}
            onChange={(e) => vm.setLogIpFilter(e.target.value)}
          />

          <input
            type="text"
            placeholder="Cercar text en logs..."
            value={vm.logSearchFilter}
            onChange={(e) => vm.setLogSearchFilter(e.target.value)}
          />
        </div>

        <p style={{ marginTop: '10px', marginBottom: '10px' }}>
          Mostrant <strong>{vm.filteredLogs.length}</strong> logs
        </p>

        <div className="dashboard-logs-scroll-container">
          <LogsTable logs={vm.filteredLogs} />
        </div>
      </div>

      <h2>
        {vm.alertStatusFilter === 'ALL' && 'Totes les alertes'}
        {vm.alertStatusFilter === 'OPEN' && 'Alertes obertes'}
        {vm.alertStatusFilter === 'CLOSED' && 'Alertes tancades'}
      </h2>

      <div className="dashboard-alerts-scroll-container">
        <AlertsTable alerts={vm.filteredAlerts || []} onCloseAlert={vm.closeAlert} />
      </div>
    </div>
  )
}
