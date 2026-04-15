package com.tfg.siem.dto;

import com.tfg.siem.model.CaseStatus;

import java.time.LocalDateTime;
import java.util.List;

public class CaseResponse {

    private Long id;
    private String title;
    private String description;
    private String owner;
    private CaseStatus status;
    private List<Long> alertIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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

    public List<Long> getAlertIds() {
        return alertIds;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public void setStatus(CaseStatus status) {
        this.status = status;
    }

    public void setAlertIds(List<Long> alertIds) {
        this.alertIds = alertIds;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
