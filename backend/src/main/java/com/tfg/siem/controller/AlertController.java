package com.tfg.siem.controller;

import com.tfg.siem.dto.AlertResponse;
import com.tfg.siem.dto.CloseAlertRequest;
import com.tfg.siem.dto.CrossCompanyAlertResponse;
import com.tfg.siem.service.AlertService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping("/company/{companyId}")
    public List<AlertResponse> getAlertsByCompany(@PathVariable Long companyId) {
        return alertService.getAlertsByCompany(companyId);
    }

    @GetMapping("/company/{companyId}/open")
    public List<AlertResponse> getOpenAlertsByCompany(@PathVariable Long companyId) {
        return alertService.getOpenAlertsByCompany(companyId);
    }

    @GetMapping("/cross-company")
    public List<CrossCompanyAlertResponse> getCrossCompanyAlerts(
            @RequestParam List<Long> companyIds,
            @RequestParam(required = false, defaultValue = "2") Integer minAffectedCompanies) {
        return alertService.getCrossCompanyAlerts(companyIds, minAffectedCompanies);
    }

    @PatchMapping("/{alertId}/close")
    public AlertResponse closeAlert(
            @PathVariable Long alertId,
            @Valid @RequestBody(required = false) CloseAlertRequest request) {
        return alertService.closeAlert(alertId, request);
    }
}
