package com.smartlab.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartlab.dto.IssueRequest;
import com.smartlab.dto.IssueResponse;
import com.smartlab.entity.Computer;
import com.smartlab.entity.Issue;
import com.smartlab.service.IssueService;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    // ── POST /api/issues
    // Student submits a new issue report
    @PostMapping
    public ResponseEntity<Issue> reportIssue(@Valid @RequestBody IssueRequest request) {
        Issue created = issueService.reportIssue(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ── GET /api/issues?labId=1
    // Get all issues for a lab (admin view)
    @GetMapping
    public ResponseEntity<List<IssueResponse>> getAllIssues(
            @RequestParam Long labId,
            @RequestParam(required = false) Issue.Status status) {

        List<IssueResponse> issues;
		if (status != null)
			issues = issueService.getIssuesByStatus(labId, status);
		else
			issues = issueService.getAllIssuesByLab(labId);

        return ResponseEntity.ok(issues);
    }

    // ── GET /api/issues/{id}
    // Get one issue by ID
    @GetMapping("/{id}")
    public ResponseEntity<Issue> getIssueById(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.getIssueById(id));
    }

    // ── GET /api/issues/computer/{computerId}
    // All issues ever reported on a specific PC
    @GetMapping("/computer/{computerId}")
    public ResponseEntity<List<IssueResponse>> getIssuesByComputer(@PathVariable Long computerId) {
        return ResponseEntity.ok(issueService.getIssuesByComputer(computerId));
    }

    // ── PATCH /api/issues/{id}/status
    // Admin updates issue status (OPEN → IN_PROGRESS → FIXED)
    @PatchMapping("/{id}/status")
    public ResponseEntity<Issue> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Issue.Status newStatus = Issue.Status.valueOf(body.get("status").toUpperCase());
        String notes      = body.get("notes");
        String resolvedBy = body.get("resolvedBy");

        Issue updated = issueService.updateIssueStatus(id, newStatus, notes, resolvedBy);
        return ResponseEntity.ok(updated);
        
    }

    // ── GET /api/issues/activity
    // Recent activity log for admin dashboard
    @GetMapping("/activity")
    public ResponseEntity<?> getRecentActivity() {
        return ResponseEntity.ok(issueService.getRecentActivity());
    }
}
