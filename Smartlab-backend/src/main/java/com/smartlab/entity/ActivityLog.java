package com.smartlab.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "issue_id")
    private Long issueId;

    @Column(name = "computer_id")
    private Long computerId;

    @Column(name = "action", nullable = false, length = 255)
    private String action;

    @Column(name = "performed_by", length = 150)
    private String performedBy = "System";

    @Column(name = "performed_at")
    private LocalDateTime performedAt;

    @PrePersist
    public void setPerformedAt() {
        this.performedAt = LocalDateTime.now();
    }

    // Convenience constructor
    public ActivityLog(Long issueId, Long computerId, String action, String performedBy) {
        this.issueId     = issueId;
        this.computerId  = computerId;
        this.action      = action;
        this.performedBy = performedBy;
    }
}
