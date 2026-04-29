package com.smartlab.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which computer this issue was reported on
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "computer_id", nullable = false)
    @NotNull 
    @JsonIgnore
    private Computer computer;

    @Column(name = "student_name", nullable = false, length = 150)
    @NotBlank(message = "Student name is required")
    private String studentName;

    @Column(name = "roll_number", nullable = false, length = 50)
    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    // Issue category e.g. "Not Booting", "Keyboard", "No Internet"
    @Column(name = "issue_type", nullable = false, length = 100)
    @NotBlank(message = "Issue type is required")
    private String issueType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity = Severity.MEDIUM;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.OPEN;

    @Column(name = "reported_at")
    private LocalDateTime reportedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by", length = 150)
    private String resolvedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    public void setReportedAt() {
        this.reportedAt = LocalDateTime.now();
    }

    public enum Severity {
        MINOR, MEDIUM, HIGH, CRITICAL
    }

    public enum Status {
        OPEN, IN_PROGRESS, FIXED, CLOSED
    }
}
