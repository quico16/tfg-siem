package com.tfg.siem.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.tfg.siem.model.LogLevel;

import java.time.LocalDateTime;

public class LogResponse {

    private Long id;
    private LocalDateTime timestamp;
    private Long companyId;
    private String companyName;
    private Long sourceId;
    private String sourceName;
    private String sourceType;
    private LogLevel level;
    private String message;
    private String ip;
    private JsonNode rawLog;
    private LocalDateTime createdAt;

    public LogResponse() {
    }

    public Long getId() {
        return id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public String getSourceName() {
        return sourceName;
    }

    public String getSourceType() {
        return sourceType;
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

    public JsonNode getRawLog() {
        return rawLog;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public void setSourceId(Long sourceId) {
        this.sourceId = sourceId;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
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

    public void setRawLog(JsonNode rawLog) {
        this.rawLog = rawLog;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}