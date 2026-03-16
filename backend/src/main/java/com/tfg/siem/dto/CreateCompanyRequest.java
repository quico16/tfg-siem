package com.tfg.siem.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCompanyRequest {

    @NotBlank
    private String name;

    public CreateCompanyRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}