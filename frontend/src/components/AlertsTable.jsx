export default function AlertsTable({ alerts, onCloseAlert }) {
  const formatDateToSeconds = (value) => {
    const text = String(value ?? '')
    const withoutMs = text.split('.')[0]
    return withoutMs.replace('T', ' ')
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Company</th>
          <th>Type</th>
          <th>Affected Companies</th>
          <th>Date</th>
          <th>Level</th>
          <th>Message</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((alert) => (
          <tr key={alert.id}>
            <td>{alert.id}</td>
            <td>{alert.companyName ?? '-'}</td>
            <td>{alert.sharedTypeLabel ?? '-'}</td>
            <td>{(alert.affectedCompanyNames || []).join(', ') || '-'}</td>
            <td>{formatDateToSeconds(alert.createdAt)}</td>
            <td>{alert.severity}</td>
            <td>{alert.message}</td>
            <td>{alert.status}</td>
            <td>
              {alert.status === 'OPEN' ? (
                <button onClick={() => onCloseAlert(alert.id)}>Close</button>
              ) : (
                <span>-</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
