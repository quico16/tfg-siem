package com.tfg.siem.dto;

import com.tfg.siem.model.AlertResolutionType;
import jakarta.validation.constraints.Size;

public class CloseAlertRequest {

    private AlertResolutionType resolutionType;

    @Size(max = 500)
    private String resolutionNote;

    public AlertResolutionType getResolutionType() {
        return resolutionType;
    }

    public String getResolutionNote() {
        return resolutionNote;
    }

    public void setResolutionType(AlertResolutionType resolutionType) {
        this.resolutionType = resolutionType;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote;
    }
}
