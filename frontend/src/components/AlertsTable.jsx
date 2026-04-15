import { useState } from 'react'

const resolutionTypes = ['TRUE_POSITIVE', 'FALSE_POSITIVE', 'BENIGN']

export default function AlertsTable({ alerts, onCloseAlert }) {
  const [closeDrafts, setCloseDrafts] = useState({})

  const formatDateToSeconds = (value) => {
    const text = String(value ?? '')
    const withoutMs = text.split('.')[0]
    return withoutMs.replace('T', ' ')
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
          <th>Rule Key</th>
          <th>Fingerprint</th>
          <th>Correlation Key</th>
          <th>Message</th>
          <th>Status</th>
          <th>Resolution</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((alert) => {
          const draft = closeDrafts[alert.id] || {
            resolutionType: 'TRUE_POSITIVE',
            resolutionNote: ''
          }

          return (
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
                <div style={{ display: 'grid', gap: '6px' }}>
                  <select
                    value={draft.resolutionType}
                    onChange={(event) =>
                      setCloseDrafts((current) => ({
                        ...current,
                        [alert.id]: {
                          ...draft,
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
                    value={draft.resolutionNote}
                    onChange={(event) =>
                      setCloseDrafts((current) => ({
                        ...current,
                        [alert.id]: {
                          ...draft,
                          resolutionNote: event.target.value
                        }
                      }))
                    }
                  />
                </div>
              </td>
              <td>
                {alert.status === 'OPEN' ? (
                  <button
                    onClick={() =>
                      onCloseAlert(alert.id, {
                        resolutionType: draft.resolutionType,
                        resolutionNote: draft.resolutionNote
                      })
                    }
                  >
                    Close with classification
                  </button>
                ) : (
                  <span>{alert.resolutionType ?? '-'}</span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
