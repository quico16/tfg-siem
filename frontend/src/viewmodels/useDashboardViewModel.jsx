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

function normalizeAlertMessage(message) {
  return String(message || '')
    .toLowerCase()
    .replace(/^critical log detected from source\s+[^:]+:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildCorrelationKey(alert) {
  return `${alert.severity}|${normalizeAlertMessage(alert.message)}`
}

export function useDashboardViewModel() {
  const [companies, setCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [summary, setSummary] = useState(null)
  const [levels, setLevels] = useState([])
  const [alerts, setAlerts] = useState([])
  const [selectedAffectedCompanyIds, setSelectedAffectedCompanyIds] = useState([])
  const [affectedCompaniesFilterMode, setAffectedCompaniesFilterMode] = useState('ALL_ALERTS')
  const [affectedAlertsViewMode, setAffectedAlertsViewMode] = useState('ANY_SELECTED')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [alertStatusFilter, setAlertStatusFilter] = useState('ALL')
  const [levelFilter, setLevelFilter] = useState('ALL')

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
        setSelectedCompanyId('ALL')
      }
    } catch (err) {
      setError('Error carregant empreses')
      console.error(err)
    }
  }, [selectedCompanyId])

  const loadDashboardData = useCallback(async () => {
    if (selectedCompanyIds.length === 0) {
      setSummary(null)
      setLevels([])
      setAlerts([])
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
    } catch (err) {
      setError('Error carregant dades del dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedCompanyIds])

  const closeAlert = async (alertId) => {
    try {
      await alertService.closeAlert(alertId)
      await loadDashboardData()
    } catch (err) {
      setError('No s’ha pogut tancar l’alerta')
      console.error(err)
    }
  }

  const availableAlertCompanies = useMemo(() => {
    if (!isAllCompaniesSelected) {
      return []
    }

    return companies.map((company) => ({
      id: String(company.id),
      name: company.name ?? `Empresa ${company.id}`
    }))
  }, [companies, isAllCompaniesSelected])

  const filteredAlerts = useMemo(() => {
    let nextAlerts = alerts

    if (alertStatusFilter === 'OPEN') {
      nextAlerts = nextAlerts.filter((alert) => alert.status === 'OPEN')
    }

    if (alertStatusFilter === 'CLOSED') {
      nextAlerts = nextAlerts.filter((alert) => alert.status === 'CLOSED')
    }

    if (isAllCompaniesSelected && affectedCompaniesFilterMode === 'SELECT_COMPANIES') {
      if (selectedAffectedCompanyIds.length === 0) {
        return []
      }

      nextAlerts = nextAlerts.filter((alert) =>
        selectedAffectedCompanyIds.includes(String(alert.companyId))
      )

      if (affectedAlertsViewMode === 'COMMON_SELECTED') {
        const keyToCompanies = new Map()
        nextAlerts.forEach((alert) => {
          const key = buildCorrelationKey(alert)
          const companyId = String(alert.companyId)
          const companiesForKey = keyToCompanies.get(key) || new Set()
          companiesForKey.add(companyId)
          keyToCompanies.set(key, companiesForKey)
        })

        const commonKeys = new Set()
        keyToCompanies.forEach((companySet, key) => {
          const affectsAllSelected = selectedAffectedCompanyIds.every((id) => companySet.has(id))
          if (affectsAllSelected) {
            commonKeys.add(key)
          }
        })

        nextAlerts = nextAlerts.filter((alert) => commonKeys.has(buildCorrelationKey(alert)))
      }
    }

    const keyToCompanies = new Map()
    nextAlerts.forEach((alert) => {
      const key = buildCorrelationKey(alert)
      const companiesForKey = keyToCompanies.get(key) || new Set()
      companiesForKey.add(String(alert.companyId))
      keyToCompanies.set(key, companiesForKey)
    })

    const orderedKeys = Array.from(keyToCompanies.keys()).sort()
    const keyToGroupId = new Map(
      orderedKeys.map((key, index) => [key, `GRP-${String(index + 1).padStart(3, '0')}`])
    )

    return nextAlerts.map((alert) => {
      const correlationKey = buildCorrelationKey(alert)
      const companiesAffectedCount = keyToCompanies.get(correlationKey)?.size ?? 1

      return {
        ...alert,
        correlationGroupId: keyToGroupId.get(correlationKey),
        companiesAffectedCount
      }
    })
  }, [
    alerts,
    alertStatusFilter,
    isAllCompaniesSelected,
    affectedCompaniesFilterMode,
    affectedAlertsViewMode,
    selectedAffectedCompanyIds
  ])

  useEffect(() => {
    if (!isAllCompaniesSelected) {
      setSelectedAffectedCompanyIds([])
      setAffectedCompaniesFilterMode('ALL_ALERTS')
      setAffectedAlertsViewMode('ANY_SELECTED')
      return
    }

    setSelectedAffectedCompanyIds((current) =>
      current.filter((id) => availableAlertCompanies.some((company) => company.id === id))
    )
  }, [isAllCompaniesSelected, availableAlertCompanies])

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
    availableAlertCompanies,
    filteredAlerts,
    loading,
    error,
    reload: loadDashboardData,
    closeAlert,
    alertStatusFilter,
    setAlertStatusFilter,
    selectedAffectedCompanyIds,
    setSelectedAffectedCompanyIds,
    affectedCompaniesFilterMode,
    setAffectedCompaniesFilterMode,
    affectedAlertsViewMode,
    setAffectedAlertsViewMode,
    levelFilter,
    setLevelFilter
  }
}
