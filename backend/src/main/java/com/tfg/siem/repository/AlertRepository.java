package com.tfg.siem.repository;

import com.tfg.siem.model.Alert;
import com.tfg.siem.model.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByCompanyId(Long companyId);

    List<Alert> findByCompanyIdAndStatus(Long companyId, AlertStatus status);
}