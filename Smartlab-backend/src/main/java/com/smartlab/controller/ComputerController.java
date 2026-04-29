package com.smartlab.controller;

import com.smartlab.entity.Computer;
import com.smartlab.service.ComputerService;
import com.smartlab.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smartlab.dto.ComputerResponse;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/computers")
@RequiredArgsConstructor
public class ComputerController  {

    private final ComputerService computerService;
    private final IssueService    issueService;

    // ── GET /api/computers?labId=1
    // Returns all PCs for the lab map (student + admin both use this)
//    @GetMapping
//    public ResponseEntity<List<ComputerResponse>> getAllComputers(@RequestParam Long labId) {
//        return ResponseEntity.ok(computerService.getAllComputersInLab(labId));
//    	return ResponseEntity.ok(computerService.getAllComputersInLab(labId));
//    }
    @GetMapping
    public ResponseEntity<List<ComputerResponse>> getAllComputers(@RequestParam Long labId) {
        return ResponseEntity.ok(
            computerService.getComputersWithIssueCount(labId)
        );
    }
  

//    // ── GET /api/computers/{id}
//    @GetMapping("/{id}")
//    public ResponseEntity<Computer> getComputer(@PathVariable Long id) {
//        return ResponseEntity.ok(computerService.getAllComputersInLab(1L)
//            .stream().filter(c -> c.getId().equals(id)).findFirst()
//            .orElseThrow(() -> new RuntimeException("Computer not found")));
//    }

    // ── PATCH /api/computers/{id}/status
    // Admin directly sets a PC status (Working / Minor / Faulty / Offline)
    @PatchMapping("/{id}/status")
    public ResponseEntity<Computer> updateComputerStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Computer.Status newStatus = Computer.Status.valueOf(body.get("status").toUpperCase());
        String adminName = body.getOrDefault("adminName", "Admin");

        Computer updated = issueService.updateComputerStatus(id, newStatus, adminName);
        return ResponseEntity.ok(updated);
    }

    // ── GET /api/computers/stats?labId=1
    // Dashboard summary: working count, faulty count, health %, etc.
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam Long labId) {
        return ResponseEntity.ok(computerService.getDashboardStats(labId));
    }
    
    
}
