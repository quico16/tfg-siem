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
      <summary>Ver raw</summary>
      <pre className="log-raw-pre">{JSON.stringify(rawLog, null, 2)}</pre>
    </details>
  )
}

export default function LogsTable({ logs }) {
  const safeLogs = Array.isArray(logs) ? logs : []

  if (safeLogs.length === 0) {
    return <p style={{ margin: 0 }}>No hay logs para los filtros seleccionados.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Empresa</th>
          <th>Origen</th>
          <th>Tipo origen</th>
          <th>Nivel</th>
          <th>Alerta asociada</th>
          <th>Pais IP</th>
          <th>IP</th>
          <th>Mensaje</th>
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
            <td>{log.hasAssociatedAlert ? 'Si' : 'No'}</td>
            <td>{log.ipCountry ?? 'UNKNOWN'}</td>
            <td>{log.ip ?? '-'}</td>
            <td>{log.message ?? '-'}</td>
            <td>{renderRawLog(log.rawLog)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
