package com.tfg.siem.service;

import com.tfg.siem.dto.AlertResponse;
import com.tfg.siem.dto.CrossCompanyAlertResponse;
import com.tfg.siem.exception.ResourceNotFoundException;
import com.tfg.siem.model.Alert;
import com.tfg.siem.model.AlertStatus;
import com.tfg.siem.model.Log;
import com.tfg.siem.model.LogLevel;
import com.tfg.siem.repository.AlertRepository;
import com.tfg.siem.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import com.tfg.siem.exception.BadRequestException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Comparator;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final CompanyRepository companyRepository;
    private static final Pattern SOURCE_PREFIX_PATTERN =
            Pattern.compile("^Critical log detected from source\\s+[^:]+:\\s*", Pattern.CASE_INSENSITIVE);

    public AlertService(AlertRepository alertRepository, CompanyRepository companyRepository) {
        this.alertRepository = alertRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional
    public void createCriticalAlertIfNeeded(Log log) {
        if (log.getLevel() != LogLevel.CRITICAL) {
            return;
        }

        if (alertRepository.existsByLogId(log.getId())) {
            return;
        }

        Alert alert = new Alert();
        alert.setCompany(log.getCompany());
        alert.setLog(log);
        alert.setSeverity(LogLevel.CRITICAL);
        alert.setMessage("Critical log detected from source " + log.getSource().getName() + ": " + log.getMessage());

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
                        .thenComparing(CrossCompanyAlertResponse::getLatestCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    private void validateCompanyExists(Long companyId) {
        companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));
    }

    private String buildCorrelationKey(Alert alert) {
        String normalizedMessage = normalizeAlertMessage(alert.getMessage());
        return alert.getSeverity() + "|" + normalizedMessage;
    }

    private String normalizeAlertMessage(String originalMessage) {
        if (originalMessage == null || originalMessage.isBlank()) {
            return "";
        }

        String withoutPrefix = SOURCE_PREFIX_PATTERN.matcher(originalMessage).replaceFirst("");
        return withoutPrefix.trim().replaceAll("\\s+", " ").toLowerCase();
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
        response.setMessage(normalizeAlertMessage(first.getMessage()));
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
        response.setMessage(alert.getMessage());
        response.setStatus(alert.getStatus());
        response.setCreatedAt(alert.getCreatedAt());
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
}
