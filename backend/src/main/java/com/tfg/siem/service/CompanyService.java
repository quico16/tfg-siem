package com.tfg.siem.service;

import com.tfg.siem.dto.CompanyResponse;
import com.tfg.siem.dto.CreateCompanyRequest;
import com.tfg.siem.exception.BadRequestException;
import com.tfg.siem.model.Company;
import com.tfg.siem.repository.CompanyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public CompanyResponse createCompany(CreateCompanyRequest request) {
        companyRepository.findByName(request.getName().trim())
                .ifPresent(existing -> {
                    throw new BadRequestException("A company with this name already exists");
                });

        Company company = new Company();
        company.setName(request.getName().trim());

        Company savedCompany = companyRepository.save(company);
        return mapToResponse(savedCompany);
    }

    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private CompanyResponse mapToResponse(Company company) {
        return new CompanyResponse(company.getId(), company.getName(), company.getCreatedAt());
    }
}
