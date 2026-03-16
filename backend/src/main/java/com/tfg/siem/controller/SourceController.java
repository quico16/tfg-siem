package com.tfg.siem.controller;

import com.tfg.siem.dto.CreateSourceRequest;
import com.tfg.siem.model.Source;
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
    public Source createSource(@Valid @RequestBody CreateSourceRequest request) {
        return sourceService.createSource(request);
    }

    @GetMapping("/company/{companyId}")
    public List<Source> getSourcesByCompany(@PathVariable Long companyId) {
        return sourceService.getSourcesByCompany(companyId);
    }
}