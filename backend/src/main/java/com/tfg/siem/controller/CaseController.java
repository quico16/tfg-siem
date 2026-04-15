package com.tfg.siem.controller;

import com.tfg.siem.dto.CaseResponse;
import com.tfg.siem.dto.CreateCaseRequest;
import com.tfg.siem.dto.UpdateCaseStatusRequest;
import com.tfg.siem.service.CaseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseService caseService;

    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @GetMapping
    public List<CaseResponse> getAllCases() {
        return caseService.getAllCases();
    }

    @PostMapping
    public CaseResponse createCase(@Valid @RequestBody CreateCaseRequest request) {
        return caseService.createCase(request);
    }

    @PatchMapping("/{caseId}/status")
    public CaseResponse updateStatus(
            @PathVariable Long caseId,
            @RequestBody UpdateCaseStatusRequest request) {
        return caseService.updateStatus(caseId, request);
    }
}
