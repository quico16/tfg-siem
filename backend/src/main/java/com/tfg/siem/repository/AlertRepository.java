package com.tfg.siem.repository;

import com.tfg.siem.model.Alert;
import com.tfg.siem.model.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    @Query("SELECT a FROM Alert a JOIN FETCH a.company LEFT JOIN FETCH a.log WHERE a.company.id = :companyId ORDER BY a.createdAt DESC")
    List<Alert> findByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT a FROM Alert a JOIN FETCH a.company LEFT JOIN FETCH a.log WHERE a.company.id IN :companyIds ORDER BY a.createdAt DESC")
    List<Alert> findByCompanyIdIn(@Param("companyIds") List<Long> companyIds);

    @Query("SELECT a FROM Alert a JOIN FETCH a.company LEFT JOIN FETCH a.log WHERE a.company.id = :companyId AND a.status = :status ORDER BY a.createdAt DESC")
    List<Alert> findByCompanyIdAndStatus(@Param("companyId") Long companyId, @Param("status") AlertStatus status);

    boolean existsByLogId(Long logId);

    long countByCompanyId(Long companyId);

    long countByCompanyIdAndStatus(Long companyId, AlertStatus status);
}
