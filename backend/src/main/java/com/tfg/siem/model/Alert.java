package com.tfg.siem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Represents an alert in the system.
 */
@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "log_id")
    private Log log;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LogLevel severity;

    @Column(length = 80)
    private String ruleKey;

    @Column(length = 255)
    private String fingerprint;

    @Column(length = 255)
    private String correlationKey;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertStatus status;

    @Column(length = 120)
    private String owner;

    @Column(nullable = false)
    private LocalDateTime statusUpdatedAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private AlertResolutionType resolutionType;

    @Column(length = 500)
    private String resolutionNote;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Alert() {
        this.createdAt = LocalDateTime.now();
        this.statusUpdatedAt = this.createdAt;
        this.status = AlertStatus.OPEN;
    }

    public Long getId() {
        return id;
    }

    public Company getCompany() {
        return company;
    }

    public Log getLog() {
        return log;
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

    public void setCompany(Company company) {
        this.company = company;
    }

    public void setLog(Log log) {
        this.log = log;
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
        this.statusUpdatedAt = LocalDateTime.now();
    }

    public void setOwner(String owner) {
        this.owner = owner == null ? null : owner.trim();
    }

    public void setResolutionType(AlertResolutionType resolutionType) {
        this.resolutionType = resolutionType;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote == null ? null : resolutionNote.trim();
    }
}
