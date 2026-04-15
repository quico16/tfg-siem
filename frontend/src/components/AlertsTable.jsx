import { useMemo, useState } from 'react'
import AlertInvestigationModal from './AlertInvestigationModal'

function toLower(value) {
  return String(value ?? '').toLowerCase()
}

export default function AlertsTable({ alerts, logs, onCloseAlert }) {
  const [selectedAlert, setSelectedAlert] = useState(null)

  const formatDateToSeconds = (value) => {
    const text = String(value ?? '')
    const withoutMs = text.split('.')[0]
    return withoutMs.replace('T', ' ')
  }

  const safeAlerts = Array.isArray(alerts) ? alerts : []
  const safeLogs = Array.isArray(logs) ? logs : []

  const relatedLogs = useMemo(() => {
    if (!selectedAlert) {
      return []
    }

    const selectedText = toLower(selectedAlert.message)

    return safeLogs
      .filter((log) => {
        if (selectedAlert.logId != null && String(log.id) === String(selectedAlert.logId)) {
          return true
        }

        if (toLower(log.companyName) !== toLower(selectedAlert.companyName)) {
          return false
        }

        return toLower(log.message).includes(selectedText.slice(0, 32))
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50)
  }, [selectedAlert, safeLogs])

  const relatedAlerts = useMemo(() => {
    if (!selectedAlert) {
      return []
    }

    return safeAlerts
      .filter((alert) => {
        if (alert.id === selectedAlert.id) {
          return false
        }

        if (
          alert.correlationKey &&
          selectedAlert.correlationKey &&
          toLower(alert.correlationKey) === toLower(selectedAlert.correlationKey)
        ) {
          return true
        }

        if (alert.ruleKey && selectedAlert.ruleKey && alert.ruleKey === selectedAlert.ruleKey) {
          return true
        }

        return toLower(alert.message).includes(toLower(selectedAlert.message).slice(0, 32))
      })
      .slice(0, 50)
  }, [selectedAlert, safeAlerts])

  return (
    <>
      <table className="sticky-header-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Company</th>
            <th>Type</th>
            <th>Affected Companies</th>
            <th>Date</th>
            <th>Level</th>
            <th>Rule Key</th>
            <th>Fingerprint</th>
            <th>Correlation Key</th>
            <th>Message</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {safeAlerts.map((alert) => (
            <tr key={alert.id}>
              <td>{alert.id}</td>
              <td>{alert.companyName ?? '-'}</td>
              <td>{alert.sharedTypeLabel ?? '-'}</td>
              <td>{(alert.affectedCompanyNames || []).join(', ') || '-'}</td>
              <td>{formatDateToSeconds(alert.createdAt)}</td>
              <td>{alert.severity}</td>
              <td>{alert.ruleKey ?? '-'}</td>
              <td>{alert.fingerprint ?? '-'}</td>
              <td>{alert.correlationKey ?? '-'}</td>
              <td>{alert.message}</td>
              <td>{alert.status}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setSelectedAlert(alert)}>Investigate</button>
                  {alert.status === 'OPEN' ? (
                    <button onClick={() => onCloseAlert(alert.id)}>Close</button>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AlertInvestigationModal
        alert={selectedAlert}
        relatedLogs={relatedLogs}
        relatedAlerts={relatedAlerts}
        onClose={() => setSelectedAlert(null)}
      />
    </>
  )
}
