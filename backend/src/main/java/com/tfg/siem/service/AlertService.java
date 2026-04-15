package com.tfg.siem.service;

import com.tfg.siem.dto.AlertResponse;
import com.tfg.siem.dto.CrossCompanyAlertResponse;
import com.tfg.siem.exception.BadRequestException;
import com.tfg.siem.exception.ResourceNotFoundException;
import com.tfg.siem.model.Alert;
import com.tfg.siem.model.AlertStatus;
import com.tfg.siem.model.Log;
import com.tfg.siem.model.LogLevel;
import com.tfg.siem.model.SourceType;
import com.tfg.siem.repository.AlertRepository;
import com.tfg.siem.repository.CompanyRepository;
import com.tfg.siem.repository.LogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class AlertService {

    private static final String RULE_BRUTE_FORCE_LOGIN = "BRUTE_FORCE_LOGIN";
    private static final String RULE_PASSWORD_SPRAYING = "PASSWORD_SPRAYING";
    private static final String RULE_CRITICAL_BURST_IP = "CRITICAL_BURST_IP";
    private static final String RULE_PHISHING_MAIL_CAMPAIGN = "PHISHING_MAIL_CAMPAIGN";
    private static final String RULE_RANSOMWARE_PATTERN_EDR = "RANSOMWARE_PATTERN_EDR";
    private static final String RULE_LATERAL_MOVEMENT_PATTERN = "LATERAL_MOVEMENT_PATTERN";
    private static final String RULE_SEVERITY_ESCALATION_IP = "SEVERITY_ESCALATION_IP";
    private static final String RULE_CROSS_COMPANY_SHARED_INDICATOR = "CROSS_COMPANY_SHARED_INDICATOR";

    private static final Set<String> LOGIN_FAILURE_KEYWORDS = Set.of(
            "failed login",
            "login failed",
            "authentication failed",
            "invalid credentials");

    private static final Set<String> PHISHING_KEYWORDS = Set.of(
            "phishing",
            "suspicious attachment",
            "bec",
            "business email compromise",
            "malicious link");

    private static final Set<String> RANSOMWARE_KEYWORDS = Set.of(
            "ransomware",
            "mass encryption",
            "malware execution blocked",
            "malware detected");

    private static final Set<String> LATERAL_MOVEMENT_KEYWORDS = Set.of(
            "lateral movement",
            "remote service creation",
            "psexec",
            "smb spread");

    private final AlertRepository alertRepository;
    private final CompanyRepository companyRepository;
    private final LogRepository logRepository;

    public AlertService(AlertRepository alertRepository, CompanyRepository companyRepository, LogRepository logRepository) {
        this.alertRepository = alertRepository;
        this.companyRepository = companyRepository;
        this.logRepository = logRepository;
    }

    @Transactional
    public void evaluateDetectionRules(Log log) {
        applyBruteForceLoginRule(log);
        applyPasswordSprayingRule(log);
        applyCriticalBurstRule(log);
        applyPhishingCampaignRule(log);
        applyRansomwareRule(log);
        applyLateralMovementRule(log);
        applySeverityEscalationRule(log);
        applyCrossCompanySharedIndicatorRule(log);
    }

    private void applyBruteForceLoginRule(Log log) {
        if (!hasIp(log) || !isLoginFailureEvent(log)) {
            return;
        }

        LocalDateTime windowStart = log.getTimestamp().minusMinutes(10);
        List<Log> recentLogs = logRepository.findByCompanyIdAndIpAndTimestampBetween(
                log.getCompany().getId(),
                log.getIp(),
                windowStart,
                log.getTimestamp());

        long failedAttempts = recentLogs.stream().filter(this::isLoginFailureEvent).count();
        if (failedAttempts < 5) {
            return;
        }

        String message = "Brute force login pattern detected for IP " + log.getIp()
                + ": " + failedAttempts + " failed authentication events in 10 minutes.";

        createDetectionAlert(
                log,
                RULE_BRUTE_FORCE_LOGIN,
                LogLevel.WARNING,
                message,
                "ip:" + normalizeWhitespace(log.getIp()),
                "login-failure|" + normalizeWhitespace(log.getIp()),
                30);
    }

    private void applyPasswordSprayingRule(Log log) {
        if (!hasIp(log) || !isLoginFailureEvent(log)) {
            return;
        }

        LocalDateTime windowStart = log.getTimestamp().minusMinutes(15);
        List<Log> recentLogs = logRepository.findByCompanyIdAndIpAndTimestampBetween(
                log.getCompany().getId(),
                log.getIp(),
                windowStart,
                log.getTimestamp());

        long failedAttempts = recentLogs.stream().filter(this::isLoginFailureEvent).count();
        long uniqueSources = recentLogs.stream()
                .filter(this::isLoginFailureEvent)
                .map(item -> item.getSource().getId())
                .distinct()
                .count();

        if (failedAttempts < 8 || uniqueSources < 2) {
            return;
        }

        String message = "Password spraying activity detected for IP " + log.getIp()
                + ": failed authentication attempts across " + uniqueSources + " sources in 15 minutes.";

        createDetectionAlert(
                log,
                RULE_PASSWORD_SPRAYING,
                LogLevel.CRITICAL,
                message,
                "ip:" + normalizeWhitespace(log.getIp()),
                "password-spraying|" + normalizeWhitespace(log.getIp()),
                60);
    }

    private void applyCriticalBurstRule(Log log) {
        if (!hasIp(log) || log.getLevel() != LogLevel.CRITICAL) {
            return;
        }

        LocalDateTime windowStart = log.getTimestamp().minusMinutes(5);
        List<Log> recentLogs = logRepository.findByCompanyIdAndIpAndTimestampBetween(
                log.getCompany().getId(),
                log.getIp(),
                windowStart,
                log.getTimestamp());

        long criticalCount = recentLogs.stream()
                .filter(item -> item.getLevel() == LogLevel.CRITICAL)
                .count();

        if (criticalCount < 2) {
            return;
        }

        String message = "Critical burst detected for IP " + log.getIp()
                + ": " + criticalCount + " critical events in 5 minutes.";

        createDetectionAlert(
                log,
                RULE_CRITICAL_BURST_IP,
                LogLevel.CRITICAL,
                message,
                "ip:" + normalizeWhitespace(log.getIp()),
                "critical-burst|" + normalizeWhitespace(log.getIp()),
                20);
    }

    private void applyPhishingCampaignRule(Log log) {
        if (log.getSource().getType() != SourceType.MAIL) {
            return;
        }

        if (!containsAnyKeyword(buildSearchableText(log), PHISHING_KEYWORDS)) {
            return;
        }

        String normalizedIndicator = normalizeIndicator(log.getMessage());
        String message = "Phishing campaign indicator detected from mail source '" + log.getSource().getName() + "': "
                + log.getMessage();

        createDetectionAlert(
                log,
                RULE_PHISHING_MAIL_CAMPAIGN,
                LogLevel.CRITICAL,
                message,
                "indicator:" + normalizedIndicator,
                "mail-phishing|" + normalizedIndicator,
                90);
    }

    private void applyRansomwareRule(Log log) {
        if (log.getSource().getType() != SourceType.EDR) {
            return;
        }

        if (!containsAnyKeyword(buildSearchableText(log), RANSOMWARE_KEYWORDS)) {
            return;
        }

        String normalizedIndicator = normalizeIndicator(log.getMessage());
        String message = "Ransomware activity indicator detected from EDR source '" + log.getSource().getName() + "': "
                + log.getMessage();

        createDetectionAlert(
                log,
                RULE_RANSOMWARE_PATTERN_EDR,
                LogLevel.CRITICAL,
                message,
                "indicator:" + normalizedIndicator,
                "ransomware|" + normalizedIndicator,
                90);
    }

    private void applyLateralMovementRule(Log log) {
        if (!containsAnyKeyword(buildSearchableText(log), LATERAL_MOVEMENT_KEYWORDS)) {
            return;
        }

        String normalizedIndicator = normalizeIndicator(log.getMessage());
        String message = "Lateral movement pattern detected: " + log.getMessage();

        createDetectionAlert(
                log,
                RULE_LATERAL_MOVEMENT_PATTERN,
                LogLevel.CRITICAL,
                message,
                "indicator:" + normalizedIndicator,
                "lateral-movement|" + normalizedIndicator,
                60);
    }

    private void applySeverityEscalationRule(Log log) {
        if (!hasIp(log) || log.getLevel() != LogLevel.CRITICAL) {
            return;
        }

        LocalDateTime windowStart = log.getTimestamp().minusMinutes(30);
        List<Log> recentLogs = logRepository.findByCompanyIdAndIpAndTimestampBetween(
                log.getCompany().getId(),
                log.getIp(),
                windowStart,
                log.getTimestamp());

        boolean hasLowerSeverity = recentLogs.stream()
                .map(Log::getLevel)
                .anyMatch(level -> level == LogLevel.INFO || level == LogLevel.WARNING);

        if (!hasLowerSeverity) {
            return;
        }

        String message = "Severity escalation detected for IP " + log.getIp()
                + ": INFO/WARNING activity escalated to CRITICAL within 30 minutes.";

        createDetectionAlert(
                log,
                RULE_SEVERITY_ESCALATION_IP,
                LogLevel.CRITICAL,
                message,
                "ip:" + normalizeWhitespace(log.getIp()),
                "severity-escalation|" + normalizeWhitespace(log.getIp()),
                45);
    }

    private void applyCrossCompanySharedIndicatorRule(Log log) {
        if (log.getLevel() == LogLevel.INFO) {
            return;
        }

        String normalizedIndicator = normalizeIndicator(log.getMessage());
        if (normalizedIndicator.isBlank()) {
            return;
        }

        LocalDateTime windowStart = log.getTimestamp().minusMinutes(60);
        List<Log> recentLogs = logRepository.findByTimestampBetween(windowStart, log.getTimestamp());

        Set<Long> affectedCompanies = recentLogs.stream()
                .filter(item -> item.getLevel() == log.getLevel())
                .filter(item -> normalizeIndicator(item.getMessage()).equals(normalizedIndicator))
                .map(item -> item.getCompany().getId())
                .filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());

        if (affectedCompanies.size() < 2) {
            return;
        }

        String message = "Shared indicator detected across " + affectedCompanies.size()
                + " companies in 60 minutes: " + normalizedIndicator;

        createDetectionAlert(
                log,
                RULE_CROSS_COMPANY_SHARED_INDICATOR,
                log.getLevel() == LogLevel.CRITICAL ? LogLevel.CRITICAL : LogLevel.WARNING,
                message,
                log.getLevel().name() + "|" + normalizedIndicator,
                log.getLevel().name() + "|" + normalizedIndicator,
                120);
    }

    private void createDetectionAlert(
            Log log,
            String ruleKey,
            LogLevel severity,
            String message,
            String fingerprint,
            String correlationKey,
            int cooldownMinutes) {

        String normalizedFingerprint = limitLength(normalizeWhitespace(fingerprint), 255);
        if (normalizedFingerprint.isBlank()) {
            normalizedFingerprint = limitLength(ruleKey + "|" + normalizeIndicator(message), 255);
        }

        LocalDateTime threshold = LocalDateTime.now().minusMinutes(Math.max(1, cooldownMinutes));
        boolean alreadyTriggered = alertRepository.existsByCompanyIdAndRuleKeyAndFingerprintAndCreatedAtAfter(
                log.getCompany().getId(),
                ruleKey,
                normalizedFingerprint,
                threshold);

        if (alreadyTriggered) {
            return;
        }

        Alert alert = new Alert();
        alert.setCompany(log.getCompany());
        alert.setLog(log);
        alert.setSeverity(severity);
        alert.setRuleKey(limitLength(ruleKey, 80));
        alert.setFingerprint(normalizedFingerprint);
        alert.setCorrelationKey(limitLength(normalizeWhitespace(correlationKey), 255));
        alert.setMessage(limitLength(message, 1000));

        alertRepository.save(alert);
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getAlertsByCompany(Long companyId) {
        validateCompanyExists(companyId);

        return alertRepository.findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getOpenAlertsByCompany(Long companyId) {
        validateCompanyExists(companyId);

        return alertRepository.findByCompanyIdAndStatus(companyId, AlertStatus.OPEN)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CrossCompanyAlertResponse> getCrossCompanyAlerts(List<Long> companyIds, Integer minAffectedCompanies) {
        if (companyIds == null || companyIds.isEmpty()) {
            throw new BadRequestException("At least one company id is required");
        }

        List<Long> uniqueCompanyIds = companyIds.stream().distinct().toList();
        long existingCompanies = companyRepository.findAllById(uniqueCompanyIds).size();
        if (existingCompanies != uniqueCompanyIds.size()) {
            throw new BadRequestException("One or more company ids are invalid");
        }

        int selectedCount = uniqueCompanyIds.size();
        int safeMin = Math.max(1, minAffectedCompanies == null ? 2 : minAffectedCompanies);
        safeMin = Math.min(safeMin, selectedCount);
        final int minimumAffectedCompanies = safeMin;

        List<Alert> alerts = alertRepository.findByCompanyIdIn(uniqueCompanyIds);
        Map<String, List<Alert>> grouped = alerts.stream()
                .collect(java.util.stream.Collectors.groupingBy(this::buildCorrelationKey));

        return grouped.values()
                .stream()
                .map(group -> toCrossCompanyResponse(group, selectedCount))
                .filter(item -> item.getAffectedCompanies() >= minimumAffectedCompanies)
                .sorted(Comparator
                        .comparingLong(CrossCompanyAlertResponse::getAffectedCompanies).reversed()
                        .thenComparing(CrossCompanyAlertResponse::getLatestCreatedAt,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    private void validateCompanyExists(Long companyId) {
        companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));
    }

    private String buildCorrelationKey(Alert alert) {
        String baseKey = alert.getCorrelationKey();
        if (baseKey != null && !baseKey.isBlank()) {
            return alert.getSeverity() + "|" + normalizeWhitespace(baseKey).toLowerCase();
        }

        return alert.getSeverity() + "|" + normalizeIndicator(alert.getMessage());
    }

    private CrossCompanyAlertResponse toCrossCompanyResponse(List<Alert> alerts, int selectedCompanyCount) {
        Alert first = alerts.get(0);
        Map<Long, String> companiesMap = new LinkedHashMap<>();
        long openAlerts = 0;
        long closedAlerts = 0;
        LocalDateTime latestCreatedAt = null;

        for (Alert alert : alerts) {
            companiesMap.put(alert.getCompany().getId(), alert.getCompany().getName());
            if (alert.getStatus() == AlertStatus.OPEN) {
                openAlerts++;
            } else {
                closedAlerts++;
            }

            if (latestCreatedAt == null || (alert.getCreatedAt() != null && alert.getCreatedAt().isAfter(latestCreatedAt))) {
                latestCreatedAt = alert.getCreatedAt();
            }
        }

        CrossCompanyAlertResponse response = new CrossCompanyAlertResponse();
        response.setSeverity(first.getSeverity().name());
        response.setMessage(normalizeIndicator(first.getMessage()));
        response.setAffectedCompanies(companiesMap.size());
        response.setTotalSelectedCompanies(selectedCompanyCount);
        response.setCompanyNames(companiesMap.values().stream().toList());
        response.setOpenAlerts(openAlerts);
        response.setClosedAlerts(closedAlerts);
        response.setLatestCreatedAt(latestCreatedAt);
        return response;
    }

    private AlertResponse mapToResponse(Alert alert) {
        AlertResponse response = new AlertResponse();
        response.setId(alert.getId());
        response.setCompanyId(alert.getCompany().getId());
        response.setCompanyName(alert.getCompany().getName());
        response.setLogId(alert.getLog() != null ? alert.getLog().getId() : null);
        response.setSeverity(alert.getSeverity());
        response.setRuleKey(alert.getRuleKey());
        response.setFingerprint(alert.getFingerprint());
        response.setCorrelationKey(alert.getCorrelationKey());
        response.setMessage(alert.getMessage());
        response.setStatus(alert.getStatus());
        response.setCreatedAt(alert.getCreatedAt());
        response.setClosedAt(alert.getClosedAt());
        return response;
    }

    @Transactional
    public AlertResponse closeAlert(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + alertId));

        if (alert.getStatus() == AlertStatus.CLOSED) {
            throw new BadRequestException("Alert is already closed");
        }

        alert.setStatus(AlertStatus.CLOSED);
        Alert savedAlert = alertRepository.save(alert);

        return mapToResponse(savedAlert);
    }

    private boolean hasIp(Log log) {
        return log.getIp() != null && !log.getIp().isBlank();
    }

    private boolean isLoginFailureEvent(Log log) {
        return containsAnyKeyword(buildSearchableText(log), LOGIN_FAILURE_KEYWORDS);
    }

    private boolean containsAnyKeyword(String text, Set<String> keywords) {
        String lower = String.valueOf(text).toLowerCase();
        return keywords.stream().anyMatch(lower::contains);
    }

    private String buildSearchableText(Log log) {
        String raw = log.getRawLog() == null ? "" : log.getRawLog().toString();
        return (String.valueOf(log.getMessage()) + " " + raw).toLowerCase();
    }

    private String normalizeIndicator(String value) {
        return normalizeWhitespace(value).toLowerCase();
    }

    private String normalizeWhitespace(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    private String limitLength(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        if (value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
