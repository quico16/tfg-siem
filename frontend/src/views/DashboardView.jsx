import { useState } from 'react'
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
  const [showLogs, setShowLogs] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const [selectedAlertIdsForCase, setSelectedAlertIdsForCase] = useState([])
  const [caseTitle, setCaseTitle] = useState('')
  const [caseDescription, setCaseDescription] = useState('')
  const [caseOwner, setCaseOwner] = useState('')

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

        <button onClick={vm.reload}>Refresh</button>
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
          <StatCard title="Total Logs" value={vm.summary.totalLogs ?? 0} />
          <StatCard title="Total Alerts" value={vm.summary.totalAlerts ?? 0} />
          <StatCard title="Open Alerts" value={vm.summary.openAlerts ?? 0} />
          <StatCard title="Critical Logs" value={vm.summary.criticalLogs ?? 0} />
        </div>
      )}

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3>SOC Operational Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))', gap: '10px' }}>
          <div>
            <strong>Backlog Open:</strong> {vm.socMetrics.backlogOpen}
          </div>
          <div>
            <strong>Open Rate:</strong> {vm.socMetrics.openRate}%
          </div>
          <div>
            <strong>Critical Open:</strong> {vm.socMetrics.criticalOpen}
          </div>
          <div>
            <strong>MTTD:</strong>{' '}
            {vm.socMetrics.mttdMinutes == null ? 'N/A' : `${vm.socMetrics.mttdMinutes} min`}
          </div>
          <div>
            <strong>MTTR:</strong>{' '}
            {vm.socMetrics.mttrMinutes == null ? 'N/A' : `${vm.socMetrics.mttrMinutes} min`}
          </div>
          <div>
            <strong>Total Alerts:</strong> {vm.socMetrics.totalAlerts}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <LevelsChart
          levels={vm.levels || []}
          selectedLevel={vm.levelFilter}
          onLevelChange={vm.setLevelFilter}
        />
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3>Case Management</h3>
        <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Case title"
            value={caseTitle}
            onChange={(event) => setCaseTitle(event.target.value)}
          />
          <input
            type="text"
            placeholder="Case owner"
            value={caseOwner}
            onChange={(event) => setCaseOwner(event.target.value)}
          />
          <textarea
            placeholder="Case description"
            value={caseDescription}
            onChange={(event) => setCaseDescription(event.target.value)}
          />
          <p style={{ margin: 0 }}>
            Selected alerts for case: <strong>{selectedAlertIdsForCase.length}</strong>
          </p>
          <button
            disabled={!caseTitle.trim()}
            onClick={async () => {
              await vm.createCase({
                title: caseTitle,
                description: caseDescription,
                owner: caseOwner,
                alertIds: selectedAlertIdsForCase
              })
              setCaseTitle('')
              setCaseDescription('')
              setCaseOwner('')
              setSelectedAlertIdsForCase([])
            }}
          >
            Create case from selection
          </button>
        </div>
        <div className="dashboard-alerts-scroll-container">
          <table className="sticky-header-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Alerts</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(vm.cases || []).map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                  <td>{item.owner ?? '-'}</td>
                  <td>{item.status}</td>
                  <td>{(item.alertIds || []).length}</td>
                  <td>{String(item.updatedAt ?? '').replace('T', ' ').split('.')[0]}</td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(event) => vm.updateCaseStatus(item.id, event.target.value)}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </td>
                </tr>
              ))}
              {(vm.cases || []).length === 0 && (
                <tr>
                  <td colSpan={7}>No cases created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div
          className="section-header-row section-fold-header"
          role="button"
          tabIndex={0}
          onClick={() => setShowLogs((current) => !current)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowLogs((current) => !current)
            }
          }}
        >
          <h3 style={{ marginBottom: 0 }}>Log Details</h3>
          <span>{showLogs ? '▼' : '▶'}</span>
        </div>

        {showLogs && (
          <>
            <div className="logs-filters-grid" style={{ marginTop: '12px' }}>
              <select value={vm.logLevelFilter} onChange={(e) => vm.setLogLevelFilter(e.target.value)}>
                <option value="ALL">Level: all</option>
                <option value="INFO">INFO</option>
                <option value="WARNING">WARNING</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>

              <select value={vm.logSourceFilter} onChange={(e) => vm.setLogSourceFilter(e.target.value)}>
                <option value="ALL">Source: all</option>
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
                <option value="ALL">Source type: all</option>
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
                <option value="ALL">Linked alert: all</option>
                <option value="WITH_ASSOCIATED_ALERT">Only with linked alert</option>
                <option value="WITHOUT_ASSOCIATED_ALERT">Only without linked alert</option>
              </select>

              <div style={{ display: 'flex', gap: '6px' }}>
                <select
                  value={vm.logHourStartFilter}
                  onChange={(e) => vm.setLogHourStartFilter(e.target.value)}
                >
                  <option value="ALL">Start hour</option>
                  {hourOptions.map((hour) => (
                    <option key={`start-${hour}`} value={hour}>
                      {hour.padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
                <select
                  value={vm.logHourEndFilter}
                  onChange={(e) => vm.setLogHourEndFilter(e.target.value)}
                >
                  <option value="ALL">End hour</option>
                  {hourOptions.map((hour) => (
                    <option key={`end-${hour}`} value={hour}>
                      {hour.padStart(2, '0')}:59
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Filter by IP..."
                value={vm.logIpFilter}
                onChange={(e) => vm.setLogIpFilter(e.target.value)}
              />

              <input
                type="text"
                placeholder="Search text in logs..."
                value={vm.logSearchFilter}
                onChange={(e) => vm.setLogSearchFilter(e.target.value)}
              />
            </div>

            <p style={{ marginTop: '10px', marginBottom: '10px' }}>
              Showing <strong>{vm.filteredLogs.length}</strong> logs
            </p>

            <div className="dashboard-logs-scroll-container">
              <LogsTable logs={vm.filteredLogs} />
            </div>
          </>
        )}
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div
          className="section-header-row section-fold-header"
          role="button"
          tabIndex={0}
          onClick={() => setShowAlerts((current) => !current)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowAlerts((current) => !current)
            }
          }}
        >
          <h2 style={{ margin: 0 }}>
            {vm.alertStatusFilter === 'ALL' && 'All alerts'}
            {vm.alertStatusFilter === 'OPEN' && 'Open Alerts'}
            {vm.alertStatusFilter === 'CLOSED' && 'Closed Alerts'}
          </h2>
          <span>{showAlerts ? '▼' : '▶'}</span>
        </div>

        {showAlerts && (
          <>
            {vm.isAllCompaniesSelected && (
              <div
                style={{
                  marginTop: '12px',
                  marginBottom: '12px',
                  padding: '12px',
                  border: '1px solid #d5d5d5',
                  borderRadius: '8px'
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}
                >
                  <strong>Affected Companies Filter</strong>
                  <select
                    value={vm.affectedCompaniesFilterMode}
                    onChange={(e) => vm.setAffectedCompaniesFilterMode(e.target.value)}
                  >
                    <option value="ALL_ALERTS">Show all alerts</option>
                    <option value="SELECT_COMPANIES">Filter by selected companies</option>
                  </select>

                  {vm.affectedCompaniesFilterMode === 'SELECT_COMPANIES' && (
                    <select
                      value={vm.affectedAlertsViewMode}
                      onChange={(e) => vm.setAffectedAlertsViewMode(e.target.value)}
                    >
                      <option value="ANY_SELECTED">Show all alerts for selected companies</option>
                      <option value="COMMON_SELECTED">
                        Show only alerts shared by all selected companies
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
                              vm.setSelectedAffectedCompanyIds([
                                ...vm.selectedAffectedCompanyIds,
                                company.id
                              ])
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

            <div className="logs-filters-grid" style={{ marginTop: '12px' }}>
              <select
                value={vm.alertStatusFilter}
                onChange={(e) => vm.setAlertStatusFilter(e.target.value)}
              >
                <option value="ALL">All alerts</option>
                <option value="OPEN">Open only</option>
                <option value="CLOSED">Closed only</option>
              </select>

              <div style={{ display: 'flex', gap: '6px' }}>
                <select
                  value={vm.alertHourStartFilter}
                  onChange={(e) => vm.setAlertHourStartFilter(e.target.value)}
                >
                  <option value="ALL">Alert start hour</option>
                  {hourOptions.map((hour) => (
                    <option key={`alert-start-${hour}`} value={hour}>
                      {hour.padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
                <select
                  value={vm.alertHourEndFilter}
                  onChange={(e) => vm.setAlertHourEndFilter(e.target.value)}
                >
                  <option value="ALL">Alert end hour</option>
                  {hourOptions.map((hour) => (
                    <option key={`alert-end-${hour}`} value={hour}>
                      {hour.padStart(2, '0')}:59
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p style={{ marginTop: '10px', marginBottom: '10px' }}>
              Showing <strong>{vm.filteredAlerts.length}</strong> alerts
            </p>

            <div className="dashboard-alerts-scroll-container">
              <AlertsTable
                alerts={vm.filteredAlerts || []}
                onCloseAlert={vm.closeAlert}
                selectedAlertIds={selectedAlertIdsForCase}
                onToggleAlertSelection={(alertId) => {
                  setSelectedAlertIdsForCase((current) =>
                    current.includes(alertId)
                      ? current.filter((id) => id !== alertId)
                      : [...current, alertId]
                  )
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
