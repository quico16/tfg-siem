package com.tfg.siem.dto;

import com.tfg.siem.model.SourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateSourceRequest {

    @NotBlank
    private String name;

    @NotNull
    private SourceType type;

    @NotNull
    private Long companyId;

    public CreateSourceRequest() {
    }

    public String getName() {
        return name;
    }

    public SourceType getType() {
        return type;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(SourceType type) {
        this.type = type;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }
}