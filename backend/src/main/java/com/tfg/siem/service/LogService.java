package com.tfg.siem.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tfg.siem.dto.CreateLogRequest;
import com.tfg.siem.dto.LogResponse;
import com.tfg.siem.model.Company;
import com.tfg.siem.model.Log;
import com.tfg.siem.model.Source;
import com.tfg.siem.repository.CompanyRepository;
import com.tfg.siem.repository.LogRepository;
import com.tfg.siem.repository.SourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LogService {

    private final LogRepository logRepository;
    private final CompanyRepository companyRepository;
    private final SourceRepository sourceRepository;
    private final ObjectMapper objectMapper;

    public LogService(
            LogRepository logRepository,
            CompanyRepository companyRepository,
            SourceRepository sourceRepository,
            ObjectMapper objectMapper) {
        this.logRepository = logRepository;
        this.companyRepository = companyRepository;
        this.sourceRepository = sourceRepository;
        this.objectMapper = objectMapper;
    }

    public LogResponse createLog(CreateLogRequest request) {
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Source source = sourceRepository.findById(request.getSourceId())
                .orElseThrow(() -> new RuntimeException("Source not found"));

        Log log = new Log();
        log.setTimestamp(request.getTimestamp());
        log.setCompany(company);
        log.setSource(source);
        log.setLevel(request.getLevel());
        log.setMessage(request.getMessage());
        log.setIp(request.getIp());

        try {
            if (request.getRawLog() != null && !request.getRawLog().isBlank()) {
                JsonNode rawLogJson = objectMapper.readTree(request.getRawLog());
                log.setRawLog(rawLogJson);
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid rawLog JSON format", e);
        }

        Log savedLog = logRepository.save(log);
        return mapToResponse(savedLog);
    }

    public List<LogResponse> getLogsByCompany(Long companyId) {
        return logRepository.findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private LogResponse mapToResponse(Log log) {
        LogResponse response = new LogResponse();
        response.setId(log.getId());
        response.setTimestamp(log.getTimestamp());
        response.setCompanyId(log.getCompany().getId());
        response.setCompanyName(log.getCompany().getName());
        response.setSourceId(log.getSource().getId());
        response.setSourceName(log.getSource().getName());
        response.setSourceType(log.getSource().getType().name());
        response.setLevel(log.getLevel());
        response.setMessage(log.getMessage());
        response.setIp(log.getIp());
        response.setRawLog(log.getRawLog());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }
}