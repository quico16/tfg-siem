package com.tfg.siem.repository;

import com.tfg.siem.model.Source;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SourceRepository extends JpaRepository<Source, Long> {
    List<Source> findByCompanyId(Long companyId);
}