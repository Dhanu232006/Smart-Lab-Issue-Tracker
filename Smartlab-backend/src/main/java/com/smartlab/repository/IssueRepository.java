package com.smartlab.repository;


import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import com.smartlab.entity.Issue;

import java.time.LocalDateTime;
import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByComputerIdOrderByReportedAtDesc(Long computerId);

    List<Issue> findByStatusOrderByReportedAtDesc(Issue.Status status);

    @Query("SELECT i FROM Issue i JOIN i.computer c WHERE c.lab.id = :labId ORDER BY i.reportedAt DESC")
    List<Issue> findAllByLabId(@Param("labId") Long labId);

    @Query("SELECT i FROM Issue i JOIN i.computer c WHERE c.lab.id = :labId AND i.status = :status ORDER BY i.reportedAt DESC")
    List<Issue> findByLabIdAndStatus(@Param("labId") Long labId,
                                    @Param("status") Issue.Status status);

    @Query("SELECT COUNT(i) FROM Issue i JOIN i.computer c WHERE c.lab.id = :labId AND i.status = :status")
    long countByLabIdAndStatus(@Param("labId") Long labId,
                              @Param("status") Issue.Status status);

    @Query("SELECT i FROM Issue i JOIN i.computer c WHERE c.lab.id = :labId AND i.status = 'FIXED' AND i.resolvedAt >= :startOfDay")
    List<Issue> findFixedToday(@Param("labId") Long labId,
                              @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT i.issueType, COUNT(i) FROM Issue i JOIN i.computer c WHERE c.lab.id = :labId GROUP BY i.issueType ORDER BY COUNT(i) DESC")
    List<Object[]> countByIssueType(@Param("labId") Long labId);
}
