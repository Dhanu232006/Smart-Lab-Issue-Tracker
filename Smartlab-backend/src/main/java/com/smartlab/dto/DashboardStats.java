package com.smartlab.dto;


import lombok.Data;

////─────────────────────────────────────────────
////RESPONSE: Dashboard summary stats
////─────────────────────────────────────────────
@Data
public class DashboardStats {
    public long totalPcs;
    public long working;
    public long minor;
    public long faulty;
    public long offline;
    public long openIssues;
    public long inProgressIssues;
    public long fixedToday;
    public int healthPercent;
}