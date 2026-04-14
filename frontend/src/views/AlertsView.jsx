export default function AlertsView() {
  return (
    <div style={{ padding: '24px' }}>
      <h1>Alerts</h1>
      <p>This view will be connected later based on the selected company.</p>
    </div>
  )
}

/*export default function AlertsView() {
  const vm = useAlertsViewModel()

  return (
    <div>
      <h1>Alerts</h1>

      {vm.loading && <LoadingSpinner />}
      {vm.error && <ErrorMessage message={vm.error} />}

      <AlertsTable alerts={vm.alerts || []} onCloseAlert={vm.closeAlert} />
    </div>
  )
}
*/
