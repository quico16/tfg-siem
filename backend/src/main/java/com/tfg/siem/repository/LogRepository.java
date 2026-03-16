package com.tfg.siem.repository;

import com.tfg.siem.model.Log;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface LogRepository extends JpaRepository<Log, Long> {

    List<Log> findByCompanyId(Long companyId);

    List<Log> findByCompanyIdAndTimestampBetween(
            Long companyId,
            LocalDateTime start,
            LocalDateTime end);
}