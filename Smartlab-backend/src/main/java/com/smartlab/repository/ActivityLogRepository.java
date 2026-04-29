package com.smartlab.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.smartlab.entity.ActivityLog;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findTop20ByOrderByPerformedAtDesc();

    List<ActivityLog> findByIssueIdOrderByPerformedAtDesc(Long issueId);
}