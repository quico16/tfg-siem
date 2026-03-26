package com.tfg.siem.controller;

import com.tfg.siem.dto.DashboardSummaryResponse;
import com.tfg.siem.dto.LevelCountResponse;
import com.tfg.siem.service.DashboardService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/company/{companyId}/summary")
    public DashboardSummaryResponse getSummary(@PathVariable Long companyId) {
        return dashboardService.getSummary(companyId);
    }

    @GetMapping("/company/{companyId}/levels")
    public List<LevelCountResponse> getLevels(@PathVariable Long companyId) {
        return dashboardService.getLevels(companyId);
    }
}