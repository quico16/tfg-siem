package com.tfg.siem.service;

import com.tfg.siem.dto.CreateSourceRequest;
import com.tfg.siem.model.Company;
import com.tfg.siem.model.Source;
import com.tfg.siem.repository.CompanyRepository;
import com.tfg.siem.repository.SourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SourceService {

    private final SourceRepository sourceRepository;
    private final CompanyRepository companyRepository;

    public SourceService(SourceRepository sourceRepository, CompanyRepository companyRepository) {
        this.sourceRepository = sourceRepository;
        this.companyRepository = companyRepository;
    }

    public Source createSource(CreateSourceRequest request) {
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Source source = new Source();
        source.setName(request.getName());
        source.setType(request.getType());
        source.setCompany(company);

        return sourceRepository.save(source);
    }

    public List<Source> getSourcesByCompany(Long companyId) {
        return sourceRepository.findByCompanyId(companyId);
    }
}