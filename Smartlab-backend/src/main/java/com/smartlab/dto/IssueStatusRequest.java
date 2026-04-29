package com.smartlab.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.smartlab.entity.Issue;


//─────────────────────────────────────────────
//REQUEST: Admin updates issue status
//─────────────────────────────────────────────
@Data
class IssueStatusRequest {
@NotNull
public Issue.Status status;
public String notes;
public String resolvedBy;
}
