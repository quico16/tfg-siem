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

function renderRawLog(rawLog) {
  if (rawLog == null) {
    return <span>-</span>
  }

  return (
    <details>
      <summary>View raw</summary>
      <pre className="log-raw-pre">{JSON.stringify(rawLog, null, 2)}</pre>
    </details>
  )
}

export default function LogsTable({ logs }) {
  const safeLogs = Array.isArray(logs) ? logs : []

  if (safeLogs.length === 0) {
    return <p style={{ margin: 0 }}>No logs found for the selected filters.</p>
  }

  return (
    <table>
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
          <th>Raw log</th>
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
            <td>{renderRawLog(log.rawLog)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
