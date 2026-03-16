package com.tfg.siem.dto;

import com.tfg.siem.model.LogLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class CreateLogRequest {

    @NotNull
    private LocalDateTime timestamp;

    @NotNull
    private Long companyId;

    @NotNull
    private Long sourceId;

    @NotNull
    private LogLevel level;

    @NotBlank
    private String message;

    private String ip;

    private String rawLog;

    public CreateLogRequest() {
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public LogLevel getLevel() {
        return level;
    }

    public String getMessage() {
        return message;
    }

    public String getIp() {
        return ip;
    }

    public String getRawLog() {
        return rawLog;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public void setSourceId(Long sourceId) {
        this.sourceId = sourceId;
    }

    public void setLevel(LogLevel level) {
        this.level = level;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public void setRawLog(String rawLog) {
        this.rawLog = rawLog;
    }
}