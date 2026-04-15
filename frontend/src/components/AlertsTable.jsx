import { useMemo, useState } from 'react'

const workflowStatuses = [
  'OPEN',
  'ACKNOWLEDGED',
  'IN_PROGRESS',
  'ESCALATED',
  'RESOLVED',
  'FALSE_POSITIVE',
  'CLOSED'
]

export default function AlertsTable({ alerts, onCloseAlert, onUpdateWorkflow }) {
  const [draftById, setDraftById] = useState({})

  const formatDateToSeconds = (value) => {
    const text = String(value ?? '')
    const withoutMs = text.split('.')[0]
    return withoutMs.replace('T', ' ')
  }

  const safeAlerts = useMemo(() => (Array.isArray(alerts) ? alerts : []), [alerts])

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

  return (
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
              <td>{alert.message}</td>
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
                  <button onClick={() => onUpdateWorkflow(alert.id, draft)}>Save workflow</button>
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
  )
}
