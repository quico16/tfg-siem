package com.tfg.siem.service;

import com.tfg.siem.dto.CaseResponse;
import com.tfg.siem.dto.CreateCaseRequest;
import com.tfg.siem.dto.UpdateCaseStatusRequest;
import com.tfg.siem.exception.ResourceNotFoundException;
import com.tfg.siem.model.Alert;
import com.tfg.siem.model.IncidentCase;
import com.tfg.siem.repository.AlertRepository;
import com.tfg.siem.repository.IncidentCaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
public class CaseService {

    private final IncidentCaseRepository caseRepository;
    private final AlertRepository alertRepository;

    public CaseService(IncidentCaseRepository caseRepository, AlertRepository alertRepository) {
        this.caseRepository = caseRepository;
        this.alertRepository = alertRepository;
    }

    @Transactional(readOnly = true)
    public List<CaseResponse> getAllCases() {
        return caseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public CaseResponse createCase(CreateCaseRequest request) {
        IncidentCase incidentCase = new IncidentCase();
        incidentCase.setTitle(request.getTitle());
        incidentCase.setDescription(request.getDescription());
        incidentCase.setOwner(request.getOwner());

        if (request.getAlertIds() != null && !request.getAlertIds().isEmpty()) {
            List<Alert> alerts = alertRepository.findAllById(request.getAlertIds());
            incidentCase.setAlerts(new HashSet<>(alerts));
        }

        return toResponse(caseRepository.save(incidentCase));
    }

    @Transactional
    public CaseResponse updateStatus(Long caseId, UpdateCaseStatusRequest request) {
        IncidentCase incidentCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with id: " + caseId));

        if (request.getStatus() != null) {
            incidentCase.setStatus(request.getStatus());
        }

        return toResponse(caseRepository.save(incidentCase));
    }

    private CaseResponse toResponse(IncidentCase incidentCase) {
        CaseResponse response = new CaseResponse();
        response.setId(incidentCase.getId());
        response.setTitle(incidentCase.getTitle());
        response.setDescription(incidentCase.getDescription());
        response.setOwner(incidentCase.getOwner());
        response.setStatus(incidentCase.getStatus());
        response.setAlertIds(incidentCase.getAlerts().stream().map(Alert::getId).toList());
        response.setCreatedAt(incidentCase.getCreatedAt());
        response.setUpdatedAt(incidentCase.getUpdatedAt());
        return response;
    }
}
