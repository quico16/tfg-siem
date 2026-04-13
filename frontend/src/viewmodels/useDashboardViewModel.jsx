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
  const [commonAlerts, setCommonAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [alertStatusFilter, setAlertStatusFilter] = useState('ALL')
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [commonAlertsMode, setCommonAlertsMode] = useState('ALL_SELECTED')
  const [minAffectedCompanies, setMinAffectedCompanies] = useState(2)

  const defaults = getDefaultDateRange()
  const [startDate, setStartDate] = useState(defaults.startDate)
  const [endDate, setEndDate] = useState(defaults.endDate)

  const isAllCompaniesSelected = selectedCompanyId === 'ALL'

  const selectedCompanyIds = useMemo(() => {
    if (isAllCompaniesSelected) {
      return companies.map((company) => String(company.id))
    }

    if (!selectedCompanyId) {
      return []
    }

    return [selectedCompanyId]
  }, [companies, isAllCompaniesSelected, selectedCompanyId])

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

  const effectiveMinAffectedCompanies = useMemo(() => {
    if (selectedCompanyIds.length === 0) {
      return 1
    }

    if (commonAlertsMode === 'ALL_SELECTED') {
      return selectedCompanyIds.length
    }

    const parsed = Number(minAffectedCompanies)
    const safeParsed = Number.isFinite(parsed) ? parsed : 2
    const boundedMin = Math.max(1, Math.floor(safeParsed))
    return Math.min(boundedMin, selectedCompanyIds.length)
  }, [selectedCompanyIds.length, commonAlertsMode, minAffectedCompanies])

  const loadDashboardData = useCallback(async () => {
    if (selectedCompanyIds.length === 0) {
      setSummary(null)
      setLevels([])
      setAlerts([])
      setCommonAlerts([])
      return
    }

    setLoading(true)
    setError('')

    try {
      const resultsByCompany = await Promise.all(
        selectedCompanyIds.map(async (companyId) => {
          const [summaryData, levelsData, alertsData] = await Promise.all([
            dashboardService.getSummary(companyId),
            dashboardService.getLevels(companyId),
            alertService.getAll(companyId)
          ])

          return {
            summaryData,
            levelsData,
            alertsData
          }
        })
      )

      const mergedSummary = resultsByCompany.reduce(
        (acc, current) => ({
          totalLogs: acc.totalLogs + (current.summaryData?.totalLogs ?? 0),
          totalAlerts: acc.totalAlerts + (current.summaryData?.totalAlerts ?? 0),
          openAlerts: acc.openAlerts + (current.summaryData?.openAlerts ?? 0),
          criticalLogs: acc.criticalLogs + (current.summaryData?.criticalLogs ?? 0),
          totalSources: acc.totalSources + (current.summaryData?.totalSources ?? 0)
        }),
        { totalLogs: 0, totalAlerts: 0, openAlerts: 0, criticalLogs: 0, totalSources: 0 }
      )

      const levelsMap = new Map()
      resultsByCompany.forEach(({ levelsData }) => {
        ;(levelsData ?? []).forEach((item) => {
          const key = item.level
          const previousCount = levelsMap.get(key) ?? 0
          levelsMap.set(key, previousCount + (item.count ?? 0))
        })
      })

      const mergedLevels = Array.from(levelsMap.entries()).map(([level, count]) => ({
        level,
        count
      }))

      const mergedAlerts = resultsByCompany
        .flatMap(({ alertsData }) => alertsData ?? [])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setSummary(mergedSummary)
      setLevels(mergedLevels)
      setAlerts(mergedAlerts)

      if (isAllCompaniesSelected && selectedCompanyIds.length > 1) {
        const commonAlertsData = await alertService.getCrossCompany(
          selectedCompanyIds,
          effectiveMinAffectedCompanies
        )
        setCommonAlerts(commonAlertsData ?? [])
      } else {
        setCommonAlerts([])
      }
    } catch (err) {
      setError('Error carregant dades del dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedCompanyIds, effectiveMinAffectedCompanies, isAllCompaniesSelected])

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
    selectedCompanyIds,
    isAllCompaniesSelected,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    summary,
    levels,
    alerts,
    commonAlerts,
    filteredAlerts,
    loading,
    error,
    reload: loadDashboardData,
    closeAlert,
    alertStatusFilter,
    setAlertStatusFilter,
    levelFilter,
    setLevelFilter,
    commonAlertsMode,
    setCommonAlertsMode,
    minAffectedCompanies,
    setMinAffectedCompanies,
    effectiveMinAffectedCompanies
  }
}
