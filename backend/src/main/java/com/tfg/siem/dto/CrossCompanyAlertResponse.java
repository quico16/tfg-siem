package com.tfg.siem.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CrossCompanyAlertResponse {

    private String severity;
    private String message;
    private long affectedCompanies;
    private long totalSelectedCompanies;
    private List<String> companyNames;
    private long openAlerts;
    private long closedAlerts;
    private LocalDateTime latestCreatedAt;

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getAffectedCompanies() {
        return affectedCompanies;
    }

    public void setAffectedCompanies(long affectedCompanies) {
        this.affectedCompanies = affectedCompanies;
    }

    public long getTotalSelectedCompanies() {
        return totalSelectedCompanies;
    }

    public void setTotalSelectedCompanies(long totalSelectedCompanies) {
        this.totalSelectedCompanies = totalSelectedCompanies;
    }

    public List<String> getCompanyNames() {
        return companyNames;
    }

    public void setCompanyNames(List<String> companyNames) {
        this.companyNames = companyNames;
    }

    public long getOpenAlerts() {
        return openAlerts;
    }

    public void setOpenAlerts(long openAlerts) {
        this.openAlerts = openAlerts;
    }

    public long getClosedAlerts() {
        return closedAlerts;
    }

    public void setClosedAlerts(long closedAlerts) {
        this.closedAlerts = closedAlerts;
    }

    public LocalDateTime getLatestCreatedAt() {
        return latestCreatedAt;
    }

    public void setLatestCreatedAt(LocalDateTime latestCreatedAt) {
        this.latestCreatedAt = latestCreatedAt;
    }
}
