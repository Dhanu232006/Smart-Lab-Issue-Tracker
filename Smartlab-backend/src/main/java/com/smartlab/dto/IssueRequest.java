package com.smartlab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import com.smartlab.entity.Issue;

// ─────────────────────────────────────────────
//  REQUEST: Student submits a new issue report
// ─────────────────────────────────────────────
@Data
public class IssueRequest {

    @NotNull(message = "Computer ID is required")
    private Long computerId;

    @NotBlank(message = "Student name is required")
    private String studentName;

    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    @NotBlank(message = "Issue type is required")
    private String issueType;

    private Issue.Severity severity = Issue.Severity.MEDIUM;

    private String description;
}

