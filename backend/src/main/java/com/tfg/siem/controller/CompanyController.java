package com.tfg.siem.controller;

import com.tfg.siem.dto.CompanyResponse;
import com.tfg.siem.dto.CreateCompanyRequest;
import com.tfg.siem.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    public CompanyResponse createCompany(@Valid @RequestBody CreateCompanyRequest request) {
        return companyService.createCompany(request);
    }

    @GetMapping
    public List<CompanyResponse> getAllCompanies() {
        return companyService.getAllCompanies();
    }
}
