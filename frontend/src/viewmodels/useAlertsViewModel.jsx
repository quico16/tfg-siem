import { useEffect, useState, useCallback } from 'react'
import { alertService } from '../services/alertService'

export function useAlertsViewModel() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadAlerts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await alertService.getAll()
      setAlerts(data)
    } catch (err) {
      setError('Error carregant alertes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const closeAlert = async (alertId) => {
    try {
      await alertService.closeAlert(alertId)
      await loadAlerts()
    } catch (err) {
      setError('No s’ha pogut tancar l’alerta')
      console.error(err)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  return {
    alerts,
    loading,
    error,
    closeAlert,
    reload: loadAlerts
  }
}