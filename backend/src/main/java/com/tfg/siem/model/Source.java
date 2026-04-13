package com.tfg.siem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Represents a source of alerts in the system.
 */
@Entity
@Table(name = "sources")
public class Source {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SourceType type;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    public Source() {
    }

    public Source(String name, SourceType type, Company company) {
        this.name = name;
        this.type = type;
        this.company = company;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public SourceType getType() {
        return type;
    }

    public Company getCompany() {
        return company;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(SourceType type) {
        this.type = type;
    }

    public void setCompany(Company company) {
        this.company = company;
    }
}
