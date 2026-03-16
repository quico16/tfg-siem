package com.tfg.siem.service;

import com.tfg.siem.dto.CreateCompanyRequest;
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

    public Company createCompany(CreateCompanyRequest request) {
        Company company = new Company();
        company.setName(request.getName());
        return companyRepository.save(company);
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }
}