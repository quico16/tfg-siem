package com.tfg.siem.dto;

import com.tfg.siem.model.AlertStatus;
import jakarta.validation.constraints.Size;

public class UpdateAlertWorkflowRequest {

    private AlertStatus status;

    @Size(max = 120)
    private String owner;

    public AlertStatus getStatus() {
        return status;
    }

    public String getOwner() {
        return owner;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }
}
