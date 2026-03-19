package com.tfg.siem.service;

import com.tfg.siem.dto.CreateSourceRequest;
import com.tfg.siem.dto.SourceResponse;
import com.tfg.siem.exception.ResourceNotFoundException;
import com.tfg.siem.model.Company;
import com.tfg.siem.model.Source;
import com.tfg.siem.repository.CompanyRepository;
import com.tfg.siem.repository.SourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SourceService {

    private final SourceRepository sourceRepository;
    private final CompanyRepository companyRepository;

    public SourceService(SourceRepository sourceRepository, CompanyRepository companyRepository) {
        this.sourceRepository = sourceRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional
    public SourceResponse createSource(CreateSourceRequest request) {
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

        Source source = new Source();
        source.setName(request.getName().trim());
        source.setType(request.getType());
        source.setCompany(company);

        Source savedSource = sourceRepository.save(source);
        return mapToResponse(savedSource);
    }

    @Transactional(readOnly = true)
    public List<SourceResponse> getSourcesByCompany(Long companyId) {
        companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        return sourceRepository.findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private SourceResponse mapToResponse(Source source) {
        SourceResponse response = new SourceResponse();
        response.setId(source.getId());
        response.setName(source.getName());
        response.setType(source.getType().name());
        response.setCompanyId(source.getCompany().getId());
        response.setCompanyName(source.getCompany().getName());
        return response;
    }
}