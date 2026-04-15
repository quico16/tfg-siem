function formatDate(dateValue) {
  if (!dateValue) {
    return '-'
  }

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleString()
}

export default function AlertInvestigationModal({ alert, relatedLogs, relatedAlerts, onClose }) {
  if (!alert) {
    return null
  }

  return (
    <div className="raw-log-modal-overlay" role="dialog" aria-modal="true" aria-label="Alert 360 view">
      <div className="raw-log-modal-content">
        <div className="section-header-row" style={{ marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>Alert 360 - #{alert.id}</h3>
          <button onClick={onClose}>Close</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
          <div><strong>Company:</strong> {alert.companyName ?? '-'}</div>
          <div><strong>Severity:</strong> {alert.severity ?? '-'}</div>
          <div><strong>Status:</strong> {alert.status ?? '-'}</div>
          <div><strong>Created:</strong> {formatDate(alert.createdAt)}</div>
          <div><strong>Rule key:</strong> {alert.ruleKey ?? '-'}</div>
          <div><strong>Correlation key:</strong> {alert.correlationKey ?? '-'}</div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <strong>Message</strong>
          <p style={{ margin: '6px 0 0 0' }}>{alert.message ?? '-'}</p>
        </div>

        <div style={{ marginTop: '16px' }}>
          <h4 style={{ marginBottom: '8px' }}>Related Timeline</h4>
          <p style={{ marginTop: 0 }}>
            <strong>{relatedLogs.length}</strong> related logs and <strong>{relatedAlerts.length}</strong> related alerts.
          </p>
          <div className="dashboard-logs-scroll-container">
            <table className="sticky-header-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Severity/Level</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {relatedAlerts.map((item) => (
                  <tr key={`alert-${item.id}`}>
                    <td>Alert</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>{item.companyName ?? '-'}</td>
                    <td>{item.severity ?? '-'}</td>
                    <td>{item.message ?? '-'}</td>
                  </tr>
                ))}
                {relatedLogs.map((item) => (
                  <tr key={`log-${item.id}`}>
                    <td>Log</td>
                    <td>{formatDate(item.timestamp)}</td>
                    <td>{item.companyName ?? '-'}</td>
                    <td>{item.level ?? '-'}</td>
                    <td>{item.message ?? '-'}</td>
                  </tr>
                ))}
                {relatedAlerts.length === 0 && relatedLogs.length === 0 && (
                  <tr>
                    <td colSpan={5}>No related evidence found for this alert.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
