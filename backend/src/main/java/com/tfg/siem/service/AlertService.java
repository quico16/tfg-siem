package com.tfg.siem.service;

import com.tfg.siem.dto.AlertResponse;
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

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final CompanyRepository companyRepository;

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

    private void validateCompanyExists(Long companyId) {
        companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));
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