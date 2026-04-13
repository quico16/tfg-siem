export default function AlertsTable({ alerts, onCloseAlert }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Empresa</th>
          <th>Fecha</th>
          <th>Nivell</th>
          <th>Missatge</th>
          <th>Estat</th>
          <th>Acció</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((alert) => (
          <tr key={alert.id}>
            <td>{alert.id}</td>
            <td>{alert.companyName ?? '-'}</td>
            <td>{alert.createdAt}</td>
            <td>{alert.severity}</td>
            <td>{alert.message}</td>
            <td>{alert.status}</td>
            <td>
              {alert.status === 'OPEN' ? (
                <button onClick={() => onCloseAlert(alert.id)}>Tancar</button>
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
