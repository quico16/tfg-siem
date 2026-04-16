package com.tfg.siem.dto;

import com.tfg.siem.model.AlertStatus;
import com.tfg.siem.model.AlertResolutionType;
import com.tfg.siem.model.LogLevel;

import java.time.LocalDateTime;

public class AlertResponse {

    private Long id;
    private Long companyId;
    private String companyName;
    private Long logId;
    private LogLevel severity;
    private String ruleKey;
    private String fingerprint;
    private String correlationKey;
    private String message;
    private AlertStatus status;
    private String owner;
    private LocalDateTime statusUpdatedAt;
    private AlertResolutionType resolutionType;
    private String resolutionNote;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt;

    public AlertResponse() {
    }

    public Long getId() {
        return id;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public Long getLogId() {
        return logId;
    }

    public LogLevel getSeverity() {
        return severity;
    }

    public String getRuleKey() {
        return ruleKey;
    }

    public String getFingerprint() {
        return fingerprint;
    }

    public String getCorrelationKey() {
        return correlationKey;
    }

    public String getMessage() {
        return message;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getOwner() {
        return owner;
    }

    public LocalDateTime getStatusUpdatedAt() {
        return statusUpdatedAt;
    }

    public AlertResolutionType getResolutionType() {
        return resolutionType;
    }

    public String getResolutionNote() {
        return resolutionNote;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public void setLogId(Long logId) {
        this.logId = logId;
    }

    public void setSeverity(LogLevel severity) {
        this.severity = severity;
    }

    public void setRuleKey(String ruleKey) {
        this.ruleKey = ruleKey;
    }

    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }

    public void setCorrelationKey(String correlationKey) {
        this.correlationKey = correlationKey;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public void setStatusUpdatedAt(LocalDateTime statusUpdatedAt) {
        this.statusUpdatedAt = statusUpdatedAt;
    }

    public void setResolutionType(AlertResolutionType resolutionType) {
        this.resolutionType = resolutionType;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    }
}
