package com.tfg.siem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "incident_cases")
public class IncidentCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 120)
    private String owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CaseStatus status;

    @ManyToMany
    @JoinTable(
            name = "case_alerts",
            joinColumns = @JoinColumn(name = "case_id"),
            inverseJoinColumns = @JoinColumn(name = "alert_id"))
    private Set<Alert> alerts = new HashSet<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public IncidentCase() {
        this.status = CaseStatus.OPEN;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getOwner() {
        return owner;
    }

    public CaseStatus getStatus() {
        return status;
    }

    public Set<Alert> getAlerts() {
        return alerts;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setTitle(String title) {
        this.title = title;
        this.updatedAt = LocalDateTime.now();
    }

    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public void setOwner(String owner) {
        this.owner = owner;
        this.updatedAt = LocalDateTime.now();
    }

    public void setStatus(CaseStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public void setAlerts(Set<Alert> alerts) {
        this.alerts = alerts;
        this.updatedAt = LocalDateTime.now();
    }
}
