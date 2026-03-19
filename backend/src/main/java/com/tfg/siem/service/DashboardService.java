package com.tfg.siem.service;

import com.tfg.siem.dto.DashboardSummaryResponse;
import com.tfg.siem.dto.LevelCountResponse;
import com.tfg.siem.exception.ResourceNotFoundException;
import com.tfg.siem.model.AlertStatus;
import com.tfg.siem.model.LogLevel;
import com.tfg.siem.repository.AlertRepository;
import com.tfg.siem.repository.CompanyRepository;
import com.tfg.siem.repository.LogRepository;
import com.tfg.siem.repository.SourceRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DashboardService {

    private final CompanyRepository companyRepository;
    private final LogRepository logRepository;
    private final AlertRepository alertRepository;
    private final SourceRepository sourceRepository;

    public DashboardService(
            CompanyRepository companyRepository,
            LogRepository logRepository,
            AlertRepository alertRepository,
            SourceRepository sourceRepository) {
        this.companyRepository = companyRepository;
        this.logRepository = logRepository;
        this.alertRepository = alertRepository;
        this.sourceRepository = sourceRepository;
    }

    public DashboardSummaryResponse getSummary(Long companyId) {
        companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        long totalLogs = logRepository.countByCompanyId(companyId);
        long totalAlerts = alertRepository.countByCompanyId(companyId);
        long openAlerts = alertRepository.countByCompanyIdAndStatus(companyId, AlertStatus.OPEN);
        long criticalLogs = logRepository.countByCompanyIdAndLevel(companyId, LogLevel.CRITICAL);
        long totalSources = sourceRepository.countByCompanyId(companyId);

        return new DashboardSummaryResponse(totalLogs, totalAlerts, openAlerts, criticalLogs, totalSources);
    }

    public List<LevelCountResponse> getLevels(Long companyId) {
        companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        return List.of(
                new LevelCountResponse("INFO", logRepository.countByCompanyIdAndLevel(companyId, LogLevel.INFO)),
                new LevelCountResponse("WARNING", logRepository.countByCompanyIdAndLevel(companyId, LogLevel.WARNING)),
                new LevelCountResponse("CRITICAL",
                        logRepository.countByCompanyIdAndLevel(companyId, LogLevel.CRITICAL)));
    }
}