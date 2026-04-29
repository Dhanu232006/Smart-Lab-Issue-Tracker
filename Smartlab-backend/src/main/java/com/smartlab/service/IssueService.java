package com.smartlab.service;

import com.smartlab.dto.IssueRequest;
import com.smartlab.dto.IssueResponse;
import com.smartlab.entity.ActivityLog;
import com.smartlab.entity.Computer;
import com.smartlab.entity.Issue;
import com.smartlab.repository.ActivityLogRepository;
import com.smartlab.repository.ComputerRepository;
import com.smartlab.repository.IssueRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository       issueRepository;
    private final ComputerRepository    computerRepository;
    private final ActivityLogRepository activityLogRepository;

    // ── Student: report a new issue ──────────────────────────────────
    @Transactional
    public Issue reportIssue(IssueRequest req) {
        // Find the computer
        Computer computer = computerRepository.findById(req.getComputerId())
            .orElseThrow(() -> new RuntimeException("Computer not found: id=" + req.getComputerId()));

        // Create issue
        Issue issue = new Issue();
        issue.setComputer(computer);
        issue.setStudentName(req.getStudentName());
        issue.setRollNumber(req.getRollNumber());
        issue.setIssueType(req.getIssueType());
        issue.setSeverity(req.getSeverity());
        issue.setDescription(req.getDescription());
        issue.setStatus(Issue.Status.OPEN);

        Issue saved = issueRepository.save(issue);

        // Update computer status based on severity
        Computer.Status newPcStatus = switch (req.getSeverity()) {
            case CRITICAL, HIGH -> Computer.Status.FAULTY;
            case MEDIUM         -> Computer.Status.MINOR;
            case MINOR          -> Computer.Status.MINOR;
        };

        // Only downgrade status, never upgrade automatically
        if (computer.getStatus() == Computer.Status.WORKING) {
            computer.setStatus(newPcStatus);
            computerRepository.save(computer);
        }

        // Log the action
        String msg = String.format("Issue #%d reported on PC-%02d by %s — %s (%s)",
            saved.getId(), computer.getPcNumber(),
            req.getStudentName(), req.getIssueType(), req.getSeverity());
        activityLogRepository.save(new ActivityLog(saved.getId(), computer.getId(), msg, "Student"));

        return saved;
    }

    // ── Admin: change issue status ────────────────────────────────────
    @Transactional
    public Issue updateIssueStatus(Long issueId, Issue.Status newStatus, String notes, String resolvedBy) {
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new RuntimeException("Issue not found: id=" + issueId));

        Issue.Status oldStatus = issue.getStatus();
        issue.setStatus(newStatus);

        if (notes != null)       issue.setNotes(notes);
        if (resolvedBy != null)  issue.setResolvedBy(resolvedBy);

        // Set resolved timestamp when fixed/closed
        if (newStatus == Issue.Status.FIXED || newStatus == Issue.Status.CLOSED) {
            issue.setResolvedAt(LocalDateTime.now());
            // Mark the PC as working again
            Computer computer = issue.getComputer();
            boolean hasOtherOpenIssues = issueRepository
                .findByComputerIdOrderByReportedAtDesc(computer.getId())
                .stream()
                .anyMatch(i -> !i.getId().equals(issueId)
                    && (i.getStatus() == Issue.Status.OPEN || i.getStatus() == Issue.Status.IN_PROGRESS));

            if (!hasOtherOpenIssues) {
                computer.setStatus(Computer.Status.WORKING);
                computerRepository.save(computer);
            }
        }

        Issue saved = issueRepository.save(issue);

        // Log
        String msg = String.format("Issue #%d on PC-%02d: %s → %s",
            issueId, issue.getComputer().getPcNumber(), oldStatus, newStatus);
        activityLogRepository.save(new ActivityLog(issueId, issue.getComputer().getId(), msg,
            resolvedBy != null ? resolvedBy : "Admin"));

        return saved;
    }

    // ── Admin: update PC status directly ────────────────────────────
    @Transactional
    public Computer updateComputerStatus(Long computerId, Computer.Status newStatus, String adminName) {
        Computer computer = computerRepository.findById(computerId)
            .orElseThrow(() -> new RuntimeException("Computer not found: id=" + computerId));

        Computer.Status old = computer.getStatus();
        computer.setStatus(newStatus);
        Computer saved = computerRepository.save(computer);

        String msg = String.format("PC-%02d status changed: %s → %s",
            computer.getPcNumber(), old, newStatus);
        activityLogRepository.save(new ActivityLog(null, computerId, msg, adminName));

        return saved;
    }

    // ── Queries ──────────────────────────────────────────────────────

    public List<IssueResponse> getAllIssuesByLab(Long labId) {
        
        
        List<Issue> issues = issueRepository.findAllByLabId(labId);

        return issues.stream().map(issue -> {
            IssueResponse res = new IssueResponse();

            res.id = issue.getId();
            res.computerId = issue.getComputer().getId();
            res.pcLabel = "PC-" + String.format("%02d", issue.getComputer().getPcNumber());

            res.studentName = issue.getStudentName();
            res.rollNumber = issue.getRollNumber();
            res.issueType = issue.getIssueType();
            res.severity = issue.getSeverity();
            res.description = issue.getDescription();

            res.status = issue.getStatus();
            res.reportedAt = issue.getReportedAt();
            res.resolvedAt = issue.getResolvedAt();
            res.resolvedBy = issue.getResolvedBy();
            res.notes = issue.getNotes();

            return res;
        }).toList();
        
    }
    
    
    

//    public List<Issue> getIssuesByStatus(Long labId, Issue.Status status) {
//        return issueRepository.findByLabIdAndStatus(labId, status);
//    }
   
    public List<IssueResponse> getIssuesByStatus(Long labId, Issue.Status status) {

        List<Issue> issues = issueRepository.findByLabIdAndStatus(labId, status);

        return issues.stream().map(issue -> {
            IssueResponse res = new IssueResponse();

            res.id = issue.getId();
            res.computerId = issue.getComputer().getId();
            res.pcLabel = "PC-" + String.format("%02d", issue.getComputer().getPcNumber());

            res.studentName = issue.getStudentName();
            res.rollNumber = issue.getRollNumber();
            res.issueType = issue.getIssueType();
            res.severity = issue.getSeverity();
            res.description = issue.getDescription();

            res.status = issue.getStatus();
            res.reportedAt = issue.getReportedAt();
            res.resolvedAt = issue.getResolvedAt();
            res.resolvedBy = issue.getResolvedBy();
            res.notes = issue.getNotes();

            return res;
        }).toList();
    }
   
    public Issue getIssueById(Long id) {
        return issueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Issue not found: id=" + id));
    }

//    public List<Issue> getIssuesByComputer(Long computerId) {
//    	
//    	
//    	
//        return issueRepository.findByComputerIdOrderByReportedAtDesc(computerId);
//        
//    }
    
    public List<IssueResponse> getIssuesByComputer(Long computerId) {

        List<Issue> issues = issueRepository.findByComputerIdOrderByReportedAtDesc(computerId);

        return issues.stream().map(issue -> {

            IssueResponse res = new IssueResponse();

            res.id = issue.getId();
            res.computerId = issue.getComputer().getId();
            res.pcLabel = "PC-" + String.format("%02d", issue.getComputer().getPcNumber());

            res.studentName = issue.getStudentName();
            res.rollNumber = issue.getRollNumber();
            res.issueType = issue.getIssueType();
            res.severity = issue.getSeverity();   // keep enum
            res.description = issue.getDescription();

            res.status = issue.getStatus();       // keep enum
            res.reportedAt = issue.getReportedAt();
            res.resolvedAt = issue.getResolvedAt();
            res.resolvedBy = issue.getResolvedBy();
            res.notes = issue.getNotes();

            return res;

        }).toList();
    }
    
    
    
    

    public List<ActivityLog> getRecentActivity() {
        return activityLogRepository.findTop20ByOrderByPerformedAtDesc();
    }
}
