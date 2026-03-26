package com.tfg.siem.repository;

import com.tfg.siem.model.Source;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SourceRepository extends JpaRepository<Source, Long> {

    @Query("SELECT s FROM Source s JOIN FETCH s.company WHERE s.company.id = :companyId")
    List<Source> findByCompanyId(Long companyId);

    long countByCompanyId(Long companyId);
}