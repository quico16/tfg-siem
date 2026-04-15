import { useMemo, useState } from 'react'
import AlertInvestigationModal from './AlertInvestigationModal'

const workflowStatuses = [
  'OPEN',
  'ACKNOWLEDGED',
  'IN_PROGRESS',
  'ESCALATED',
  'RESOLVED',
  'FALSE_POSITIVE',
  'CLOSED'
]

function toLower(value) {
  return String(value ?? '').toLowerCase()
}

export default function AlertsTable({
  alerts,
  logs,
  onCloseAlert,
  onUpdateWorkflow,
  onPivotMessage
}) {
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [draftById, setDraftById] = useState({})

  const formatDateToSeconds = (value) => {
    const text = String(value ?? '')
    const withoutMs = text.split('.')[0]
    return withoutMs.replace('T', ' ')
  }

  const safeAlerts = useMemo(() => (Array.isArray(alerts) ? alerts : []), [alerts])
  const safeLogs = useMemo(() => (Array.isArray(logs) ? logs : []), [logs])

  const getDraft = (alert) => {
    const existing = draftById[alert.id]
    if (existing) {
      return existing
    }

    return {
      status: alert.status ?? 'OPEN',
      owner: alert.owner ?? ''
    }
  }

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
            <th>Risk Score</th>
            <th>Rule Key</th>
            <th>Fingerprint</th>
            <th>Correlation Key</th>
            <th>Message</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {safeAlerts.map((alert) => {
            const draft = getDraft(alert)

            return (
              <tr key={alert.id}>
                <td>{alert.id}</td>
                <td>{alert.companyName ?? '-'}</td>
                <td>{alert.sharedTypeLabel ?? '-'}</td>
                <td>{(alert.affectedCompanyNames || []).join(', ') || '-'}</td>
                <td>{formatDateToSeconds(alert.createdAt)}</td>
                <td>{alert.severity}</td>
                <td>{alert.riskScore ?? '-'}</td>
                <td>{alert.ruleKey ?? '-'}</td>
                <td>{alert.fingerprint ?? '-'}</td>
                <td>{alert.correlationKey ?? '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span>{alert.message}</span>
                    <button onClick={() => onPivotMessage?.(alert.message)}>Pivot</button>
                  </div>
                </td>
                <td>
                  <select
                    value={draft.status}
                    onChange={(event) => {
                      const nextValue = event.target.value
                      setDraftById((current) => ({
                        ...current,
                        [alert.id]: {
                          ...draft,
                          status: nextValue
                        }
                      }))
                    }}
                  >
                    {workflowStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={draft.owner}
                    placeholder="Assign owner"
                    onChange={(event) => {
                      const nextValue = event.target.value
                      setDraftById((current) => ({
                        ...current,
                        [alert.id]: {
                          ...draft,
                          owner: nextValue
                        }
                      }))
                    }}
                  />
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => setSelectedAlert(alert)}>Investigate</button>
                    <button onClick={() => onUpdateWorkflow?.(alert.id, draft)}>Save workflow</button>
                    {alert.status === 'OPEN' ? (
                      <button onClick={() => onCloseAlert(alert.id)}>Quick close</button>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
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
