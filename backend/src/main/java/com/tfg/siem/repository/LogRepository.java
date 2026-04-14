package com.tfg.siem.repository;

import com.tfg.siem.model.Log;
import com.tfg.siem.model.LogLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface LogRepository extends JpaRepository<Log, Long> {

    @Query("SELECT l FROM Log l JOIN FETCH l.company JOIN FETCH l.source WHERE l.company.id = :companyId ORDER BY l.timestamp DESC")
    List<Log> findByCompanyId(Long companyId);

    @Query("SELECT l FROM Log l JOIN FETCH l.company JOIN FETCH l.source WHERE l.company.id = :companyId AND l.timestamp BETWEEN :start AND :end ORDER BY l.timestamp DESC")
    List<Log> findByCompanyIdAndTimestampBetween(Long companyId, LocalDateTime start, LocalDateTime end);

    @Query("""
            SELECT l
            FROM Log l
            JOIN FETCH l.company
            JOIN FETCH l.source
            WHERE l.company.id = :companyId
              AND l.ip = :ip
              AND l.timestamp BETWEEN :start AND :end
            ORDER BY l.timestamp DESC
            """)
    List<Log> findByCompanyIdAndIpAndTimestampBetween(Long companyId, String ip, LocalDateTime start, LocalDateTime end);

    @Query("""
            SELECT l
            FROM Log l
            JOIN FETCH l.company
            JOIN FETCH l.source
            WHERE l.timestamp BETWEEN :start AND :end
            ORDER BY l.timestamp DESC
            """)
    List<Log> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    long countByCompanyId(Long companyId);

    long countByCompanyIdAndLevel(Long companyId, LogLevel level);
}
