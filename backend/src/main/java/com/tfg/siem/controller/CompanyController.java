package com.tfg.siem.controller;

import com.tfg.siem.dto.CompanyResponse;
import com.tfg.siem.dto.CreateCompanyRequest;
import com.tfg.siem.model.Company;
import com.tfg.siem.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

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