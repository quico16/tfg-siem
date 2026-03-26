package com.tfg.siem.controller;

import com.tfg.siem.dto.CreateLogRequest;
import com.tfg.siem.dto.LogResponse;
import com.tfg.siem.service.LogService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    @PostMapping
    public LogResponse createLog(@Valid @RequestBody CreateLogRequest request) {
        return logService.createLog(request);
    }

    @GetMapping("/company/{companyId}")
    public List<LogResponse> getLogsByCompany(
            @PathVariable Long companyId,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {
        return logService.getLogsByCompany(companyId, start, end);
    }
}