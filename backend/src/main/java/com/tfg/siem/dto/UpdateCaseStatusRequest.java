package com.tfg.siem.dto;

import com.tfg.siem.model.CaseStatus;

public class UpdateCaseStatusRequest {
    private CaseStatus status;

    public CaseStatus getStatus() {
        return status;
    }

    public void setStatus(CaseStatus status) {
        this.status = status;
    }
}
