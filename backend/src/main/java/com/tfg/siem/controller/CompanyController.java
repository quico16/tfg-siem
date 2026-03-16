package com.tfg.siem.controller;

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
    public Company createCompany(@Valid @RequestBody CreateCompanyRequest request) {
        return companyService.createCompany(request);
    }

    @GetMapping
    public List<Company> getAllCompanies() {
        return companyService.getAllCompanies();
    }
}