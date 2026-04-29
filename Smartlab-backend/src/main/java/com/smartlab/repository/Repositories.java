//package com.smartLab.repository;
//
//import com.smartLab.entity.Computer;
//import com.smartLab.entity.Issue;
//import com.smartLab.entity.ActivityLog;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//// ─────────────────────────────────────────────
////  ComputerRepository
//// ─────────────────────────────────────────────
//@Repository
//interface ComputerRepository extends JpaRepository<Computer, Long> {
//
//    // All PCs in a lab ordered by pc_number
//    List<Computer> findByLabIdOrderByPcNumber(Long labId);
//
//    // All PCs with a specific status
//    List<Computer> findByLabIdAndStatus(Long labId, Computer.Status status);
//
//    // Count by status for stats
//    long countByLabIdAndStatus(Long labId, Computer.Status status);
//
//    // Find a specific PC in a lab
//    Optional<Computer> findByLabIdAndPcNumber(Long labId, Integer pcNumber);
//}
//
//// ─────────────────────────────────────────────
////  IssueRepository
//// ─────────────────────────────────────────────
//@Repository
//interface IssueRepository extends JpaRepository<Issue, Long> {
//
//    // All issues for a specific PC
//    List<Issue> findByComputerIdOrderByReportedAtDesc(Long computerId);
//
//    // All issues with a specific status
//    List<Issue> findByStatusOrderByReportedAtDesc(Issue.Status status);
//
//    // All issues for a lab (join through computer)
//    @Query("SELECT i FROM Issue i " +
//           "JOIN i.computer c " +
//           "WHERE c.lab.id = :labId " +
//           "ORDER BY i.reportedAt DESC")
//    List<Issue> findAllByLabId(@Param("labId") Long labId);
//
//    // Issues by status for a lab
//    @Query("SELECT i FROM Issue i " +
//           "JOIN i.computer c " +
//           "WHERE c.lab.id = :labId AND i.status = :status " +
//           "ORDER BY i.reportedAt DESC")
//    List<Issue> findByLabIdAndStatus(@Param("labId") Long labId,
//                                     @Param("status") Issue.Status status);
//
//    // Count open issues for a lab
//    @Query("SELECT COUNT(i) FROM Issue i " +
//           "JOIN i.computer c " +
//           "WHERE c.lab.id = :labId AND i.status = :status")
//    long countByLabIdAndStatus(@Param("labId") Long labId,
//                                @Param("status") Issue.Status status);
//
//    // Issues fixed today
//    @Query("SELECT i FROM Issue i " +
//           "JOIN i.computer c " +
//           "WHERE c.lab.id = :labId " +
//           "AND i.status = 'FIXED' " +
//           "AND i.resolvedAt >= :startOfDay")
//    List<Issue> findFixedToday(@Param("labId") Long labId,
//                                @Param("startOfDay") LocalDateTime startOfDay);
//
//    // Issues by severity for a lab
//    @Query("SELECT i.issueType, COUNT(i) FROM Issue i " +
//           "JOIN i.computer c " +
//           "WHERE c.lab.id = :labId " +
//           "GROUP BY i.issueType " +
//           "ORDER BY COUNT(i) DESC")
//    List<Object[]> countByIssueType(@Param("labId") Long labId);
//}
//
//// ─────────────────────────────────────────────
////  ActivityLogRepository
//// ─────────────────────────────────────────────
//@Repository
//interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
//
//    // Recent activity (last 20 entries)
//    List<ActivityLog> findTop20ByOrderByPerformedAtDesc();
//
//    // Activity for a specific issue
//    List<ActivityLog> findByIssueIdOrderByPerformedAtDesc(Long issueId);
//}
