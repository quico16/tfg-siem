package com.tfg.siem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateCaseRequest {

    @NotBlank
    @Size(max = 160)
    private String title;

    @Size(max = 2000)
    private String description;

    @Size(max = 120)
    private String owner;

    private List<Long> alertIds;

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getOwner() {
        return owner;
    }

    public List<Long> getAlertIds() {
        return alertIds;
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

    public void setAlertIds(List<Long> alertIds) {
        this.alertIds = alertIds;
    }
}
