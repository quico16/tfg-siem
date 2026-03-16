package com.tfg.siem.model;

import jakarta.persistence.*;
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

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Alert() {
        this.createdAt = LocalDateTime.now();
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

    public String getMessage() {
        return message;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
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

    public void setMessage(String message) {
        this.message = message;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }
}