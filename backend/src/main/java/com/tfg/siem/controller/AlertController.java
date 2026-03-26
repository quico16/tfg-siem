package com.tfg.siem.controller;

import com.tfg.siem.dto.AlertResponse;
import com.tfg.siem.service.AlertService;
import org.springframework.web.bind.annotation.*;

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

    @PatchMapping("/{alertId}/close")
    public AlertResponse closeAlert(@PathVariable Long alertId) {
        return alertService.closeAlert(alertId);
    }
}