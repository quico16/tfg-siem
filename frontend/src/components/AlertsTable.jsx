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

const resolutionTypes = ['TRUE_POSITIVE', 'FALSE_POSITIVE', 'BENIGN']

function toLower(value) {
  return String(value ?? '').toLowerCase()
}

export default function AlertsTable({
  alerts,
  logs,
  onCloseAlert,
  onUpdateWorkflow,
  onPivotMessage,
  selectedAlertIds = [],
  onToggleAlertSelection
}) {
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [draftById, setDraftById] = useState({})
  const [closeDrafts, setCloseDrafts] = useState({})

  const formatDateToSeconds = (value) => {
    const text = String(value ?? '')
    const withoutMs = text.split('.')[0]
    return withoutMs.replace('T', ' ')
  }

  const safeAlerts = useMemo(() => (Array.isArray(alerts) ? alerts : []), [alerts])
  const safeLogs = useMemo(() => (Array.isArray(logs) ? logs : []), [logs])

  const getWorkflowDraft = (alert) => {
    const existing = draftById[alert.id]
    if (existing) {
      return existing
    }

    return {
      status: alert.status ?? 'OPEN',
      owner: alert.owner ?? ''
    }
  }

  const getCloseDraft = (alert) => {
    const existing = closeDrafts[alert.id]
    if (existing) {
      return existing
    }

    return {
      resolutionType: alert.resolutionType ?? 'TRUE_POSITIVE',
      resolutionNote: alert.resolutionNote ?? ''
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
            <th>Select</th>
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
            <th>Resolution</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {safeAlerts.map((alert) => {
            const workflowDraft = getWorkflowDraft(alert)
            const closeDraft = getCloseDraft(alert)

            return (
              <tr key={alert.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedAlertIds.includes(alert.id)}
                    onChange={() => onToggleAlertSelection?.(alert.id)}
                  />
                </td>
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
                    value={workflowDraft.status}
                    onChange={(event) => {
                      const nextValue = event.target.value
                      setDraftById((current) => ({
                        ...current,
                        [alert.id]: {
                          ...workflowDraft,
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
                    value={workflowDraft.owner}
                    placeholder="Assign owner"
                    onChange={(event) => {
                      const nextValue = event.target.value
                      setDraftById((current) => ({
                        ...current,
                        [alert.id]: {
                          ...workflowDraft,
                          owner: nextValue
                        }
                      }))
                    }}
                  />
                </td>
                <td>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <select
                      value={closeDraft.resolutionType}
                      onChange={(event) =>
                        setCloseDrafts((current) => ({
                          ...current,
                          [alert.id]: {
                            ...closeDraft,
                            resolutionType: event.target.value
                          }
                        }))
                      }
                    >
                      {resolutionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Optional close note"
                      value={closeDraft.resolutionNote}
                      onChange={(event) =>
                        setCloseDrafts((current) => ({
                          ...current,
                          [alert.id]: {
                            ...closeDraft,
                            resolutionNote: event.target.value
                          }
                        }))
                      }
                    />
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => setSelectedAlert(alert)}>Investigate</button>
                    <button onClick={() => onUpdateWorkflow?.(alert.id, workflowDraft)}>
                      Save workflow
                    </button>
                    {alert.status === 'OPEN' ? (
                      <button
                        onClick={() =>
                          onCloseAlert?.(alert.id, {
                            resolutionType: closeDraft.resolutionType,
                            resolutionNote: closeDraft.resolutionNote
                          })
                        }
                      >
                        Close with classification
                      </button>
                    ) : (
                      <span>{alert.resolutionType ?? '-'}</span>
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
