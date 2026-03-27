import { useAlertsViewModel } from '../viewmodels/useAlertsViewModel'
import AlertsTable from '../components/AlertsTable'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function AlertsView() {
  return (
    <div style={{ padding: '24px' }}>
      <h1>Alertes</h1>
      <p>Aquesta vista es connectarà més endavant per empresa seleccionada.</p>
    </div>
  )
}
/*export default function AlertsView() {
  const vm = useAlertsViewModel()

  return (
    <div>
      <h1>Alertes</h1>

      {vm.loading && <LoadingSpinner />}
      {vm.error && <ErrorMessage message={vm.error} />}

      <AlertsTable alerts={vm.alerts || []} onCloseAlert={vm.closeAlert} />
    </div>
  )
}
*/