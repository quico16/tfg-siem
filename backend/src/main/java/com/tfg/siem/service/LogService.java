package com.tfg.siem.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tfg.siem.dto.CreateLogRequest;
import com.tfg.siem.dto.LogResponse;
import com.tfg.siem.exception.BadRequestException;
import com.tfg.siem.exception.ResourceNotFoundException;
import com.tfg.siem.model.Company;
import com.tfg.siem.model.Log;
import com.tfg.siem.model.Source;
import com.tfg.siem.repository.CompanyRepository;
import com.tfg.siem.repository.LogRepository;
import com.tfg.siem.repository.SourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class LogService {

    private final LogRepository logRepository;
    private final CompanyRepository companyRepository;
    private final SourceRepository sourceRepository;
    private final ObjectMapper objectMapper;
    private final AlertService alertService;

    public LogService(
            LogRepository logRepository,
            CompanyRepository companyRepository,
            SourceRepository sourceRepository,
            ObjectMapper objectMapper,
            AlertService alertService) {
        this.logRepository = logRepository;
        this.companyRepository = companyRepository;
        this.sourceRepository = sourceRepository;
        this.objectMapper = objectMapper;
        this.alertService = alertService;
    }

    @Transactional
    public LogResponse createLog(CreateLogRequest request) {
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

        Source source = sourceRepository.findById(request.getSourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Source not found with id: " + request.getSourceId()));

        if (!source.getCompany().getId().equals(company.getId())) {
            throw new BadRequestException("Source does not belong to the provided company");
        }

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
            throw new BadRequestException("Invalid rawLog JSON format");
        }

        Log savedLog = logRepository.save(log);
        alertService.createCriticalAlertIfNeeded(savedLog);

        return mapToResponse(savedLog);
    }

    @Transactional(readOnly = true)
    public List<LogResponse> getLogsByCompany(Long companyId, String start, String end) {
        companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        List<Log> logs;

        // Invalid case: only one date provided
        if ((start != null && end == null) || (start == null && end != null)) {
            throw new BadRequestException("Both start and end dates must be provided together");
        }

        if (start != null && end != null) {
            LocalDateTime startDate;
            LocalDateTime endDate;

            try {
                startDate = LocalDateTime.parse(start);
                endDate = LocalDateTime.parse(end);
            } catch (DateTimeParseException e) {
                throw new BadRequestException("Invalid date format. Use ISO format: yyyy-MM-ddTHH:mm:ss");
            }

            if (startDate.isAfter(endDate)) {
                throw new BadRequestException("Start date must be before or equal to end date");
            }

            logs = logRepository.findByCompanyIdAndTimestampBetween(companyId, startDate, endDate);
        } else {
            logs = logRepository.findByCompanyId(companyId);
        }

        return logs.stream()
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
