import { useEffect, useState, useCallback, useMemo } from 'react'
import { companyService } from '../services/companyService'
import { dashboardService } from '../services/dashboardService'
import { alertService } from '../services/alertService'
import { logService } from '../services/logService'

function formatDateOnly(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDefaultDateRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 7)

  return {
    startDate: formatDateOnly(start),
    endDate: formatDateOnly(end)
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

function getHourFromTimestamp(timestamp) {
  if (!timestamp) {
    return null
  }

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.getHours()
}

function getMinutesBetween(startValue, endValue) {
  const start = new Date(startValue)
  const end = new Date(endValue)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null
  }

  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000))
}

export function useDashboardViewModel() {
  const [companies, setCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [summary, setSummary] = useState(null)
  const [levels, setLevels] = useState([])
  const [logs, setLogs] = useState([])
  const [alerts, setAlerts] = useState([])
  const [alertsForCorrelation, setAlertsForCorrelation] = useState([])
  const [selectedAffectedCompanyIds, setSelectedAffectedCompanyIds] = useState([])
  const [affectedCompaniesFilterMode, setAffectedCompaniesFilterMode] = useState('ALL_ALERTS')
  const [affectedAlertsViewMode, setAffectedAlertsViewMode] = useState('ANY_SELECTED')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [alertStatusFilter, setAlertStatusFilter] = useState('ALL')
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [logLevelFilter, setLogLevelFilter] = useState('ALL')
  const [logSourceFilter, setLogSourceFilter] = useState('ALL')
  const [logSourceTypeFilter, setLogSourceTypeFilter] = useState('ALL')
  const [logIpFilter, setLogIpFilter] = useState('')
  const [logSearchFilter, setLogSearchFilter] = useState('')
  const [logAlertLinkFilter, setLogAlertLinkFilter] = useState('ALL')
  const [logHourStartFilter, setLogHourStartFilter] = useState('ALL')
  const [logHourEndFilter, setLogHourEndFilter] = useState('ALL')
  const [alertHourStartFilter, setAlertHourStartFilter] = useState('ALL')
  const [alertHourEndFilter, setAlertHourEndFilter] = useState('ALL')

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
      setError('Failed to load companies')
      console.error(err)
    }
  }, [selectedCompanyId])

  const loadDashboardData = useCallback(async () => {
    if (selectedCompanyIds.length === 0) {
      setSummary(null)
      setLevels([])
      setLogs([])
      setAlerts([])
      setAlertsForCorrelation([])
      return
    }

    setLoading(true)
    setError('')

    try {
      const resultsByCompany = await Promise.all(
        selectedCompanyIds.map(async (companyId) => {
          const [summaryData, levelsData, alertsData, logsData] = await Promise.all([
            dashboardService.getSummary(companyId),
            dashboardService.getLevels(companyId),
            alertService.getAll(companyId),
            logService.getAll(companyId, `${startDate}T00:00:00`, `${endDate}T23:59:59`)
          ])

          return {
            summaryData,
            levelsData,
            alertsData,
            logsData
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
      const mergedLogs = resultsByCompany
        .flatMap(({ logsData }) => logsData ?? [])
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      const allCompanyIds = companies.map((company) => String(company.id))
      let correlationAlerts = mergedAlerts

      if (!isAllCompaniesSelected && allCompanyIds.length > selectedCompanyIds.length) {
        const nonSelectedCompanyIds = allCompanyIds.filter(
          (companyId) => !selectedCompanyIds.includes(companyId)
        )

        const otherCompanyAlerts = await Promise.all(
          nonSelectedCompanyIds.map(async (companyId) => alertService.getAll(companyId))
        )

        correlationAlerts = [...mergedAlerts, ...otherCompanyAlerts.flatMap((items) => items ?? [])]
      }

      setSummary(mergedSummary)
      setLevels(mergedLevels)
      setLogs(mergedLogs)
      setAlerts(mergedAlerts)
      setAlertsForCorrelation(correlationAlerts)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedCompanyIds, companies, isAllCompaniesSelected, startDate, endDate])

  const closeAlert = async (alertId) => {
    try {
      await alertService.closeAlert(alertId)
      await loadDashboardData()
    } catch (err) {
      setError('Failed to close alert')
      console.error(err)
    }
  }

  const availableAlertCompanies = useMemo(() => {
    if (!isAllCompaniesSelected) {
      return []
    }

    return companies.map((company) => ({
      id: String(company.id),
      name: company.name ?? `Company ${company.id}`
    }))
  }, [companies, isAllCompaniesSelected])

  const filteredAlerts = useMemo(() => {
    let nextAlerts = alerts
    const startHour = alertHourStartFilter === 'ALL' ? null : Number(alertHourStartFilter)
    const endHour = alertHourEndFilter === 'ALL' ? null : Number(alertHourEndFilter)

    if (alertStatusFilter === 'OPEN') {
      nextAlerts = nextAlerts.filter((alert) => alert.status === 'OPEN')
    }

    if (alertStatusFilter === 'CLOSED') {
      nextAlerts = nextAlerts.filter((alert) => alert.status === 'CLOSED')
    }

    if (startHour != null && endHour != null) {
      nextAlerts = nextAlerts.filter((alert) => {
        const alertHour = getHourFromTimestamp(alert.createdAt)
        if (alertHour == null) {
          return false
        }

        const isSameDayRange = startHour <= endHour
        return isSameDayRange
          ? alertHour >= startHour && alertHour <= endHour
          : alertHour >= startHour || alertHour <= endHour
      })
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

    const scopeCompanyIds =
      isAllCompaniesSelected &&
      affectedCompaniesFilterMode === 'SELECT_COMPANIES' &&
      selectedAffectedCompanyIds.length > 0
        ? selectedAffectedCompanyIds
        : selectedCompanyIds

    const scopeCompanyCount = Math.max(scopeCompanyIds.length, 1)

    const correlationSourceAlerts =
      alertsForCorrelation.length > 0 ? alertsForCorrelation : nextAlerts

    const keyToCompanies = new Map()
    correlationSourceAlerts.forEach((alert) => {
      const key = buildCorrelationKey(alert)
      const companiesForKey = keyToCompanies.get(key) || new Map()
      companiesForKey.set(String(alert.companyId), alert.companyName ?? `Company ${alert.companyId}`)
      keyToCompanies.set(key, companiesForKey)
    })

    return nextAlerts.map((alert) => {
      const correlationKey = buildCorrelationKey(alert)
      const affectedCompaniesMap = keyToCompanies.get(correlationKey) || new Map()
      const companiesAffectedCount = affectedCompaniesMap.size || 1
      const affectedCompanyNames = Array.from(affectedCompaniesMap.values())
      const sharedTypeLabel =
        companiesAffectedCount > 1
          ? `Shared (${companiesAffectedCount}/${scopeCompanyCount})`
          : `Unique (${companiesAffectedCount}/${scopeCompanyCount})`

      return {
        ...alert,
        sharedTypeLabel,
        affectedCompanyNames
      }
    })
  }, [
    alerts,
    alertsForCorrelation,
    alertStatusFilter,
    alertHourStartFilter,
    alertHourEndFilter,
    isAllCompaniesSelected,
    affectedCompaniesFilterMode,
    affectedAlertsViewMode,
    selectedAffectedCompanyIds,
    selectedCompanyIds
  ])

  const availableLogSources = useMemo(() => {
    const values = new Set()
    logs.forEach((log) => {
      if (log.sourceName) {
        values.add(log.sourceName)
      }
    })
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [logs])

  const availableLogSourceTypes = useMemo(() => {
    const values = new Set()
    logs.forEach((log) => {
      if (log.sourceType) {
        values.add(log.sourceType)
      }
    })
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [logs])

  const alertsByLogId = useMemo(() => {
    const ids = new Set()
    alerts.forEach((alert) => {
      if (alert.logId != null) {
        ids.add(String(alert.logId))
      }
    })
    return ids
  }, [alerts])

  const logsWithDerivedFields = useMemo(
    () =>
      logs.map((log) => ({
        ...log,
        hasAssociatedAlert: alertsByLogId.has(String(log.id))
      })),
    [logs, alertsByLogId]
  )

  const filteredLogs = useMemo(() => {
    const normalizedSearch = logSearchFilter.trim().toLowerCase()
    const normalizedIp = logIpFilter.trim().toLowerCase()
    const startHour = logHourStartFilter === 'ALL' ? null : Number(logHourStartFilter)
    const endHour = logHourEndFilter === 'ALL' ? null : Number(logHourEndFilter)

    return logsWithDerivedFields.filter((log) => {
      if (logLevelFilter !== 'ALL' && log.level !== logLevelFilter) {
        return false
      }

      if (logSourceFilter !== 'ALL' && log.sourceName !== logSourceFilter) {
        return false
      }

      if (logSourceTypeFilter !== 'ALL' && log.sourceType !== logSourceTypeFilter) {
        return false
      }

      if (logAlertLinkFilter === 'WITH_ASSOCIATED_ALERT' && !log.hasAssociatedAlert) {
        return false
      }

      if (logAlertLinkFilter === 'WITHOUT_ASSOCIATED_ALERT' && log.hasAssociatedAlert) {
        return false
      }

      if (startHour != null && endHour != null) {
        const logHour = getHourFromTimestamp(log.timestamp)
        if (logHour == null) {
          return false
        }

        const isSameDayRange = startHour <= endHour
        const isWithinRange = isSameDayRange
          ? logHour >= startHour && logHour <= endHour
          : logHour >= startHour || logHour <= endHour

        if (!isWithinRange) {
          return false
        }
      }

      if (normalizedIp.length > 0 && !String(log.ip ?? '').toLowerCase().includes(normalizedIp)) {
        return false
      }

      if (normalizedSearch.length > 0) {
        const searchableText = [
          log.message,
          log.sourceName,
          log.sourceType,
          log.companyName,
          log.level,
          log.ip
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!searchableText.includes(normalizedSearch)) {
          return false
        }
      }

      return true
    })
  }, [
    logsWithDerivedFields,
    logLevelFilter,
    logSourceFilter,
    logSourceTypeFilter,
    logIpFilter,
    logSearchFilter,
    logAlertLinkFilter,
    logHourStartFilter,
    logHourEndFilter
  ])

  const socMetrics = useMemo(() => {
    const openAlerts = filteredAlerts.filter((alert) => alert.status === 'OPEN')
    const closedAlerts = filteredAlerts.filter((alert) => alert.status === 'CLOSED')
    const totalAlerts = filteredAlerts.length

    const mttrSamples = closedAlerts
      .map((alert) => getMinutesBetween(alert.createdAt, alert.closedAt))
      .filter((value) => value != null)

    const logsById = new Map(logs.map((log) => [String(log.id), log]))
    const mttdSamples = filteredAlerts
      .map((alert) => {
        const sourceLog = logsById.get(String(alert.logId))
        if (!sourceLog) {
          return null
        }
        return getMinutesBetween(sourceLog.timestamp, alert.createdAt)
      })
      .filter((value) => value != null)

    const average = (items) =>
      items.length === 0 ? null : Math.round(items.reduce((acc, value) => acc + value, 0) / items.length)

    return {
      backlogOpen: openAlerts.length,
      totalAlerts,
      openRate: totalAlerts === 0 ? 0 : Math.round((openAlerts.length / totalAlerts) * 100),
      criticalOpen: openAlerts.filter((alert) => alert.severity === 'CRITICAL').length,
      mttdMinutes: average(mttdSamples),
      mttrMinutes: average(mttrSamples)
    }
  }, [filteredAlerts, logs])

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
    logs,
    alerts,
    availableAlertCompanies,
    filteredAlerts,
    availableLogSources,
    availableLogSourceTypes,
    filteredLogs,
    socMetrics,
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
    setLevelFilter,
    logLevelFilter,
    setLogLevelFilter,
    logSourceFilter,
    setLogSourceFilter,
    logSourceTypeFilter,
    setLogSourceTypeFilter,
    logIpFilter,
    setLogIpFilter,
    logSearchFilter,
    setLogSearchFilter,
    logAlertLinkFilter,
    setLogAlertLinkFilter,
    logHourStartFilter,
    setLogHourStartFilter,
    logHourEndFilter,
    setLogHourEndFilter,
    alertHourStartFilter,
    setAlertHourStartFilter,
    alertHourEndFilter,
    setAlertHourEndFilter
  }
}


