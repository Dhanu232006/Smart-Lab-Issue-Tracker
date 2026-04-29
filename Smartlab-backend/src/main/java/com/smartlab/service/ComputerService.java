package com.smartlab.service;

import com.smartlab.entity.Computer;
import com.smartlab.repository.ComputerRepository;
import com.smartlab.repository.IssueRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.smartlab.dto.ComputerResponse;

@Service
@RequiredArgsConstructor
public class ComputerService {

    private final ComputerRepository computerRepository;
    private final IssueRepository    issueRepository;

    // Get all PCs for lab map (used by both student and admin views)
//    public List<Computer> getAllComputersInLab(Long labId) {
//        return computerRepository.findByLabIdOrderByPcNumber(labId);
//    }
    public List<ComputerResponse> getComputersWithIssueCount(Long labId) {

        List<Computer> computers = computerRepository.findByLabIdOrderByPcNumber(labId);

        return computers.stream().map(comp -> {

            ComputerResponse res = new ComputerResponse();

            res.id = comp.getId();
            res.pcNumber = comp.getPcNumber();
            res.pcLabel = "PC-" + String.format("%02d", comp.getPcNumber());

            res.rowName = comp.getRowName();
            res.side = comp.getSide();
            res.status = comp.getStatus();
            res.updatedAt = comp.getUpdatedAt();

            // 🔥 important logic
            long count = comp.getIssues().stream()
                .filter(i -> i.getStatus() == com.smartlab.entity.Issue.Status.OPEN
                          || i.getStatus() == com.smartlab.entity.Issue.Status.IN_PROGRESS)
                .count();

            res.openIssueCount = count;

            return res;

        }).toList();
    }

    // Get one specific PC
    public Computer getComputer(Long labId, Integer pcNumber) {
        return computerRepository.findByLabIdAndPcNumber(labId, pcNumber)
            .orElseThrow(() -> new RuntimeException(
                "PC not found: labId=" + labId + ", pcNumber=" + pcNumber));
    }

    // Dashboard stats summary
    public Map<String, Object> getDashboardStats(Long labId) {
        long total       = computerRepository.countByLabIdAndStatus(labId, Computer.Status.WORKING)
                         + computerRepository.countByLabIdAndStatus(labId, Computer.Status.MINOR)
                         + computerRepository.countByLabIdAndStatus(labId, Computer.Status.FAULTY)
                         + computerRepository.countByLabIdAndStatus(labId, Computer.Status.OFFLINE);
        long working     = computerRepository.countByLabIdAndStatus(labId, Computer.Status.WORKING);
        long minor       = computerRepository.countByLabIdAndStatus(labId, Computer.Status.MINOR);
        long faulty      = computerRepository.countByLabIdAndStatus(labId, Computer.Status.FAULTY);
        long offline     = computerRepository.countByLabIdAndStatus(labId, Computer.Status.OFFLINE);

        long openIssues  = issueRepository.countByLabIdAndStatus(labId, com.smartlab.entity.Issue.Status.OPEN);
        long inProgress  = issueRepository.countByLabIdAndStatus(labId, com.smartlab.entity.Issue.Status.IN_PROGRESS);
        long fixedToday  = issueRepository.findFixedToday(labId,
                            LocalDate.now().atStartOfDay()).size();

        int healthPct = total > 0 ? (int) Math.round((working * 100.0) / total) : 0;

        // Issue type breakdown
        List<Object[]> typeBreakdown = issueRepository.countByIssueType(labId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPcs",        total);
        stats.put("working",         working);
        stats.put("minor",           minor);
        stats.put("faulty",          faulty);
        stats.put("offline",         offline);
        stats.put("openIssues",      openIssues);
        stats.put("inProgress",      inProgress);
        stats.put("fixedToday",      fixedToday);
        stats.put("healthPercent",   healthPct);
        
        List<Map<String, Object>> formatted = typeBreakdown.stream().map(obj -> {
            Map<String, Object> m = new HashMap<>();
            m.put("type", obj[0]);
            m.put("count", obj[1]);
            return m;
        }).toList();
        stats.put("issueTypeBreakdown", formatted);
        return stats;
    }
}
