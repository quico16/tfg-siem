package com.tfg.siem.model;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "logs")
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id", nullable = false)
    private Source source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LogLevel level;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(length = 50)
    private String ip;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private JsonNode rawLog;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Log() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Company getCompany() {
        return company;
    }

    public Source getSource() {
        return source;
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

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public void setSource(Source source) {
        this.source = source;
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
}