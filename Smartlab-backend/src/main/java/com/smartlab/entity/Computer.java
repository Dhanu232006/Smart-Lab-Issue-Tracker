package com.smartlab.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "computers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Computer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which lab this PC belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_id", nullable = false)
    @JsonIgnore
    private Lab lab;

    // PC number shown on the floor map (1–29)
    @Column(name = "pc_number", nullable = false)
    private Integer pcNumber;

    // Which physical row (ROW1, ROW2, ROW3, ROW4)
    @Column(name = "row_name", nullable = false, length = 10)
    private String rowName;

    // Which side of the aisle
    @Enumerated(EnumType.STRING)
    @Column(name = "side", nullable = false)
    private Side side;

    // Current operational status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.WORKING;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // All issues ever reported on this PC
    @OneToMany(mappedBy = "computer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Issue> issues;

    @PreUpdate
    @PrePersist
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Status {
        WORKING, MINOR, FAULTY, OFFLINE
    }

    public enum Side {
        LEFT, RIGHT
    }
}
