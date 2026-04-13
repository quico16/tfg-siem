export default function CommonAlertsTable({ commonAlerts }) {
  const safeAlerts = Array.isArray(commonAlerts) ? commonAlerts : []

  if (safeAlerts.length === 0) {
    return <p>No hi ha alertes comunes amb el filtre actual.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Severitat</th>
          <th>Missatge base</th>
          <th>Empreses afectades</th>
          <th>Empreses</th>
          <th>Obertes</th>
          <th>Tancades</th>
          <th>Ultima deteccio</th>
        </tr>
      </thead>
      <tbody>
        {safeAlerts.map((alert, index) => (
          <tr key={`${alert.severity}-${alert.message}-${index}`}>
            <td>{alert.severity}</td>
            <td>{alert.message}</td>
            <td>
              {alert.affectedCompanies}/{alert.totalSelectedCompanies}
            </td>
            <td>{(alert.companyNames ?? []).join(', ')}</td>
            <td>{alert.openAlerts}</td>
            <td>{alert.closedAlerts}</td>
            <td>{alert.latestCreatedAt ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
