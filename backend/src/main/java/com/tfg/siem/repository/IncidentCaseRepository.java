package com.tfg.siem.repository;

import com.tfg.siem.model.IncidentCase;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentCaseRepository extends JpaRepository<IncidentCase, Long> {
}
