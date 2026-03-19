package com.tfg.siem.dto;

public class DashboardSummaryResponse {

    private long totalLogs;
    private long totalAlerts;
    private long openAlerts;
    private long criticalLogs;
    private long totalSources;

    public DashboardSummaryResponse() {
    }

    public DashboardSummaryResponse(long totalLogs, long totalAlerts, long openAlerts, long criticalLogs,
            long totalSources) {
        this.totalLogs = totalLogs;
        this.totalAlerts = totalAlerts;
        this.openAlerts = openAlerts;
        this.criticalLogs = criticalLogs;
        this.totalSources = totalSources;
    }

    public long getTotalLogs() {
        return totalLogs;
    }

    public long getTotalAlerts() {
        return totalAlerts;
    }

    public long getOpenAlerts() {
        return openAlerts;
    }

    public long getCriticalLogs() {
        return criticalLogs;
    }

    public long getTotalSources() {
        return totalSources;
    }
}