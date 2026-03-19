package com.tfg.siem.controller;

import com.tfg.siem.dto.CreateSourceRequest;
import com.tfg.siem.dto.SourceResponse;
import com.tfg.siem.service.SourceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sources")
public class SourceController {

    private final SourceService sourceService;

    public SourceController(SourceService sourceService) {
        this.sourceService = sourceService;
    }

    @PostMapping
    public SourceResponse createSource(@Valid @RequestBody CreateSourceRequest request) {
        return sourceService.createSource(request);
    }

    @GetMapping("/company/{companyId}")
    public List<SourceResponse> getSourcesByCompany(@PathVariable Long companyId) {
        return sourceService.getSourcesByCompany(companyId);
    }
}