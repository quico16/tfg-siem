import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel'
import CompanySelector from '../components/CompanySelector'
import DateRangeFilter from '../components/DateRangeFilter'
import StatCard from '../components/StatCard'
import AlertsTable from '../components/AlertsTable'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import LevelsChart from '../components/LevelsChart'

export default function DashboardView() {
  const vm = useDashboardViewModel()

  return (
    <div style={{ padding: '24px' }}>
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <CompanySelector
          companies={vm.companies || []}
          selectedCompanyIds={vm.selectedCompanyIds || []}
          onChange={vm.setSelectedCompanyIds}
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

      <h2>
        {vm.alertStatusFilter === 'ALL' && 'Totes les alertes'}
        {vm.alertStatusFilter === 'OPEN' && 'Alertes obertes'}
        {vm.alertStatusFilter === 'CLOSED' && 'Alertes tancades'}
      </h2>

      <AlertsTable alerts={vm.filteredAlerts || []} onCloseAlert={vm.closeAlert} />
    </div>
  )
}
