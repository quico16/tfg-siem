import { useEffect, useState, useCallback, useMemo } from 'react'
import { companyService } from '../services/companyService'
import { dashboardService } from '../services/dashboardService'
import { alertService } from '../services/alertService'

function getDefaultDateRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 7)

  return {
    startDate: start.toISOString().slice(0, 16),
    endDate: end.toISOString().slice(0, 16)
  }
}

export function useDashboardViewModel() {
  const [companies, setCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [summary, setSummary] = useState(null)
  const [levels, setLevels] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [alertStatusFilter, setAlertStatusFilter] = useState('ALL')
  const [levelFilter, setLevelFilter] = useState('ALL')

  const defaults = getDefaultDateRange()
  const [startDate, setStartDate] = useState(defaults.startDate)
  const [endDate, setEndDate] = useState(defaults.endDate)

  const loadCompanies = useCallback(async () => {
    try {
      const data = await companyService.getAll()
      setCompanies(data)

      if (data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(String(data[0].id))
      }
    } catch (err) {
      setError('Error carregant empreses')
      console.error(err)
    }
  }, [selectedCompanyId])

  const loadDashboardData = useCallback(async () => {
    if (!selectedCompanyId) return

    setLoading(true)
    setError('')

    try {
      const [summaryData, levelsData, alertsData] = await Promise.all([
        dashboardService.getSummary(selectedCompanyId),
        dashboardService.getLevels(selectedCompanyId),
        alertService.getAll(selectedCompanyId)
      ])

      setSummary(summaryData)
      setLevels(levelsData)
      setAlerts(alertsData)
    } catch (err) {
      setError('Error carregant dades del dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedCompanyId])

  const closeAlert = async (alertId) => {
    try {
      await alertService.closeAlert(alertId)
      await loadDashboardData()
    } catch (err) {
      setError('No s’ha pogut tancar l’alerta')
      console.error(err)
    }
  }

  const filteredAlerts = useMemo(() => {
    if (alertStatusFilter === 'OPEN') {
      return alerts.filter((alert) => alert.status === 'OPEN')
    }

    if (alertStatusFilter === 'CLOSED') {
      return alerts.filter((alert) => alert.status === 'CLOSED')
    }

    return alerts
  }, [alerts, alertStatusFilter])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return {
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    summary,
    levels,
    alerts,
    filteredAlerts,
    loading,
    error,
    reload: loadDashboardData,
    closeAlert,
    alertStatusFilter,
    setAlertStatusFilter,
    levelFilter,
    setLevelFilter
  }
}