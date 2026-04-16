import { useEffect, useState, useCallback, useMemo } from 'react'
import { companyService } from '../services/companyService'
import { dashboardService } from '../services/dashboardService'
import { alertService } from '../services/alertService'
import { logService } from '../services/logService'
import { caseService } from '../services/caseService'

const FILTER_PRESETS_STORAGE_KEY = 'siem.dashboard.filterPresets'

function readFilterPresets() {
  try {
    const raw = window.localStorage.getItem(FILTER_PRESETS_STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (error) {
    console.error('Failed to read filter presets', error)
    return {}
  }
}

function writeFilterPresets(nextPresets) {
  window.localStorage.setItem(FILTER_PRESETS_STORAGE_KEY, JSON.stringify(nextPresets))
}

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

function calculateRiskScore(alert, companiesAffectedCount) {
  const severityWeight = {
    CRITICAL: 70,
    WARNING: 45,
    INFO: 25
  }

  const base = severityWeight[alert.severity] ?? 20
  const statusBonus = alert.status === 'OPEN' ? 20 : 0
  const crossCompanyBonus = companiesAffectedCount > 1 ? 10 : 0

  const createdAt = new Date(alert.createdAt)
  const ageMinutes = Number.isNaN(createdAt.getTime())
    ? Number.MAX_SAFE_INTEGER
    : Math.floor((Date.now() - createdAt.getTime()) / 60000)
  const freshnessBonus = ageMinutes <= 60 ? 10 : 0

  return Math.max(0, Math.min(100, base + statusBonus + crossCompanyBonus + freshnessBonus))
}

function getMinutesSince(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return 0
  }

  return Math.floor((Date.now() - date.getTime()) / 60000)
}

function getSlaMinutesBySeverity(severity) {
  if (severity === 'CRITICAL') {
    return 60
  }
  if (severity === 'WARNING') {
    return 240
  }
  return 720
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
  const [cases, setCases] = useState([])
  const [crossCompanyCampaigns, setCrossCompanyCampaigns] = useState([])
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
  const [alertSortMode, setAlertSortMode] = useState('RISK_DESC')
  const [filterPresets, setFilterPresets] = useState(readFilterPresets)

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

  const loadCases = useCallback(async () => {
    try {
      const data = await caseService.getAll()
      setCases(data ?? [])
    } catch (err) {
      setError('Failed to load cases')
      console.error(err)
    }
  }, [])

  const loadDashboardData = useCallback(async () => {
    if (selectedCompanyIds.length === 0) {
      setSummary(null)
      setLevels([])
      setLogs([])
      setAlerts([])
      setAlertsForCorrelation([])
      setCrossCompanyCampaigns([])
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

      const campaigns =
        selectedCompanyIds.length > 1
          ? await alertService.getCrossCompany(selectedCompanyIds.map((id) => Number(id)), 2)
          : []

      setSummary(mergedSummary)
      setLevels(mergedLevels)
      setLogs(mergedLogs)
      setAlerts(mergedAlerts)
      setAlertsForCorrelation(correlationAlerts)
      setCrossCompanyCampaigns(campaigns ?? [])
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedCompanyIds, companies, isAllCompaniesSelected, startDate, endDate])

  const closeAlert = async (alertId, payload) => {
    try {
      await alertService.closeAlert(alertId, payload)
      await loadDashboardData()
    } catch (err) {
      setError('Failed to close alert')
      console.error(err)
    }
  }

  const updateAlertWorkflow = async (alertId, payload) => {
    try {
      await alertService.updateWorkflow(alertId, payload)
      await loadDashboardData()
    } catch (err) {
      setError('Failed to update alert workflow')
      console.error(err)
    }
  }

  const createCase = async (payload) => {
    try {
      await caseService.create(payload)
      await loadCases()
    } catch (err) {
      setError('Failed to create case')
      console.error(err)
    }
  }

  const updateCaseStatus = async (caseId, status) => {
    try {
      await caseService.updateStatus(caseId, status)
      await loadCases()
    } catch (err) {
      setError('Failed to update case status')
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

    const alertsWithRisk = nextAlerts.map((alert) => {
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
        riskScore: calculateRiskScore(alert, companiesAffectedCount),
        sharedTypeLabel,
        affectedCompanyNames
      }
    })

    return [...alertsWithRisk].sort((left, right) => {
      if (alertSortMode === 'OLDEST') {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      }

      if (alertSortMode === 'NEWEST') {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      }

      const scoreDiff = (right.riskScore ?? 0) - (left.riskScore ?? 0)
      if (scoreDiff !== 0) {
        return scoreDiff
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
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
    selectedCompanyIds,
    alertSortMode
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

  const applyPresetData = useCallback((preset) => {
    if (!preset) {
      return
    }

    setSelectedCompanyId(preset.selectedCompanyId ?? 'ALL')
    setStartDate(preset.startDate ?? startDate)
    setEndDate(preset.endDate ?? endDate)

    setAlertStatusFilter(preset.alertStatusFilter ?? 'ALL')
    setAlertHourStartFilter(preset.alertHourStartFilter ?? 'ALL')
    setAlertHourEndFilter(preset.alertHourEndFilter ?? 'ALL')

    setLogLevelFilter(preset.logLevelFilter ?? 'ALL')
    setLogSourceFilter(preset.logSourceFilter ?? 'ALL')
    setLogSourceTypeFilter(preset.logSourceTypeFilter ?? 'ALL')
    setLogAlertLinkFilter(preset.logAlertLinkFilter ?? 'ALL')
    setLogHourStartFilter(preset.logHourStartFilter ?? 'ALL')
    setLogHourEndFilter(preset.logHourEndFilter ?? 'ALL')
    setLogIpFilter(preset.logIpFilter ?? '')
    setLogSearchFilter(preset.logSearchFilter ?? '')
  }, [endDate, startDate])

  const saveCurrentFilterPreset = useCallback((name) => {
    const safeName = String(name ?? '').trim()
    if (!safeName) {
      return
    }

    const nextPresets = {
      ...filterPresets,
      [safeName]: {
        selectedCompanyId,
        startDate,
        endDate,
        alertStatusFilter,
        alertHourStartFilter,
        alertHourEndFilter,
        logLevelFilter,
        logSourceFilter,
        logSourceTypeFilter,
        logAlertLinkFilter,
        logHourStartFilter,
        logHourEndFilter,
        logIpFilter,
        logSearchFilter
      }
    }

    setFilterPresets(nextPresets)
    writeFilterPresets(nextPresets)
  }, [
    filterPresets,
    selectedCompanyId,
    startDate,
    endDate,
    alertStatusFilter,
    alertHourStartFilter,
    alertHourEndFilter,
    logLevelFilter,
    logSourceFilter,
    logSourceTypeFilter,
    logAlertLinkFilter,
    logHourStartFilter,
    logHourEndFilter,
    logIpFilter,
    logSearchFilter
  ])

  const applyFilterPreset = useCallback((name) => {
    const preset = filterPresets[name]
    applyPresetData(preset)
  }, [applyPresetData, filterPresets])

  const deleteFilterPreset = useCallback((name) => {
    const nextPresets = { ...filterPresets }
    delete nextPresets[name]
    setFilterPresets(nextPresets)
    writeFilterPresets(nextPresets)
  }, [filterPresets])

  const pivotToIp = useCallback((ip) => {
    if (!ip) {
      return
    }

    setLogIpFilter(ip)
  }, [])

  const pivotToSource = useCallback((sourceName) => {
    if (!sourceName) {
      return
    }

    setLogSourceFilter(sourceName)
  }, [])

  const pivotFromAlertMessage = useCallback((message) => {
    if (!message) {
      return
    }

    setLogSearchFilter(String(message).slice(0, 80))
  }, [])

  const groupedAlerts = useMemo(() => {
    const groups = new Map()

    filteredAlerts.forEach((alert) => {
      const key = alert.correlationKey || buildCorrelationKey(alert)
      const current = groups.get(key) || {
        key,
        severity: alert.severity,
        message: alert.message,
        total: 0,
        open: 0,
        latestCreatedAt: alert.createdAt,
        alertIds: []
      }

      current.total += 1
      if (alert.status === 'OPEN') {
        current.open += 1
      }
      if (new Date(alert.createdAt).getTime() > new Date(current.latestCreatedAt).getTime()) {
        current.latestCreatedAt = alert.createdAt
      }
      current.alertIds.push(alert.id)

      groups.set(key, current)
    })

    return Array.from(groups.values()).sort((a, b) => b.open - a.open || b.total - a.total)
  }, [filteredAlerts])

  const bulkCloseAlerts = async (alertIds) => {
    try {
      await Promise.all(alertIds.map((alertId) => alertService.closeAlert(alertId)))
      await loadDashboardData()
    } catch (err) {
      setError('Failed to bulk close alerts')
      console.error(err)
    }
  }

  const alertAgingSummary = useMemo(() => {
    const openAlerts = filteredAlerts.filter((alert) => alert.status === 'OPEN')
    const buckets = {
      under1h: 0,
      between1hAnd4h: 0,
      over4h: 0
    }

    openAlerts.forEach((alert) => {
      const ageMinutes = getMinutesSince(alert.createdAt)
      if (ageMinutes < 60) {
        buckets.under1h += 1
      } else if (ageMinutes < 240) {
        buckets.between1hAnd4h += 1
      } else {
        buckets.over4h += 1
      }
    })

    return {
      totalOpen: openAlerts.length,
      ...buckets
    }
  }, [filteredAlerts])

  const slaBreachedAlerts = useMemo(
    () =>
      filteredAlerts
        .filter((alert) => alert.status === 'OPEN')
        .map((alert) => {
          const ageMinutes = getMinutesSince(alert.createdAt)
          const slaMinutes = getSlaMinutesBySeverity(alert.severity)
          return {
            ...alert,
            ageMinutes,
            slaMinutes,
            isBreached: ageMinutes > slaMinutes
          }
        })
        .filter((alert) => alert.isBreached)
        .sort((a, b) => b.ageMinutes - a.ageMinutes),
    [filteredAlerts]
  )

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
      items.length === 0
        ? null
        : Math.round(items.reduce((acc, value) => acc + value, 0) / items.length)

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
    loadCases()
  }, [loadCases])

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
    groupedAlerts,
    alertAgingSummary,
    slaBreachedAlerts,
    socMetrics,
    cases,
    crossCompanyCampaigns,
    loading,
    error,
    reload: loadDashboardData,
    closeAlert,
    updateAlertWorkflow,
    bulkCloseAlerts,
    createCase,
    updateCaseStatus,
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
    setAlertHourEndFilter,
    alertSortMode,
    setAlertSortMode,
    filterPresets,
    saveCurrentFilterPreset,
    applyFilterPreset,
    deleteFilterPreset,
    pivotToIp,
    pivotToSource,
    pivotFromAlertMessage
  }
}


