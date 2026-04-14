import { useState } from 'react'

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

export default function LogsTable({ logs }) {
  const safeLogs = Array.isArray(logs) ? logs : []
  const [selectedRawLog, setSelectedRawLog] = useState(null)

  if (safeLogs.length === 0) {
    return <p style={{ margin: 0 }}>No logs found for the selected filters.</p>
  }

  return (
    <>
      <table className="sticky-header-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Company</th>
            <th>Source</th>
            <th>Source Type</th>
            <th>Level</th>
            <th>Linked Alert</th>
            <th>IP</th>
            <th>Message</th>
            <th>Raw</th>
          </tr>
        </thead>
        <tbody>
          {safeLogs.map((log) => (
            <tr key={log.id}>
              <td>{formatDate(log.timestamp)}</td>
              <td>{log.companyName ?? '-'}</td>
              <td>{log.sourceName ?? '-'}</td>
              <td>{log.sourceType ?? '-'}</td>
              <td>{log.level ?? '-'}</td>
              <td>{log.hasAssociatedAlert ? 'Yes' : 'No'}</td>
              <td>{log.ip ?? '-'}</td>
              <td>{log.message ?? '-'}</td>
              <td>
                {log.rawLog == null ? (
                  <span>-</span>
                ) : (
                  <button onClick={() => setSelectedRawLog(log.rawLog)}>View raw</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedRawLog != null && (
        <div className="raw-log-modal-overlay" role="dialog" aria-modal="true" aria-label="Raw log">
          <div className="raw-log-modal-content">
            <div className="section-header-row" style={{ marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Raw Log</h3>
              <button onClick={() => setSelectedRawLog(null)}>Close</button>
            </div>
            <pre className="log-raw-pre">{JSON.stringify(selectedRawLog, null, 2)}</pre>
          </div>
        </div>
      )}
    </>
  )
}
