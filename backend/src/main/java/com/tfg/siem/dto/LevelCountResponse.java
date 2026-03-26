package com.tfg.siem.dto;

public class LevelCountResponse {

    private String level;
    private long count;

    public LevelCountResponse() {
    }

    public LevelCountResponse(String level, long count) {
        this.level = level;
        this.count = count;
    }

    public String getLevel() {
        return level;
    }

    public long getCount() {
        return count;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public void setCount(long count) {
        this.count = count;
    }
}