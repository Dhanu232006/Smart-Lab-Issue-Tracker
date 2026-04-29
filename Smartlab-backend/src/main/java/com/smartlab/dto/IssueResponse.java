package com.smartlab.dto;

import lombok.Data;
import java.time.LocalDateTime;
import com.smartlab.entity.Issue;


////─────────────────────────────────────────────
////RESPONSE: Issue with full PC info
////
@Data
public class IssueResponse {
    public Long id;
    public Long computerId;
    public String pcLabel;      // "PC-03"
    
    public String studentName;
    public String rollNumber;
    
    public String issueType;
   public Issue.Severity severity;
//    public String severity;
    public String description;
    public Issue.Status status;
//    public String status;
    
    public LocalDateTime reportedAt;
    public LocalDateTime resolvedAt;
    
    public String resolvedBy;
    public String notes;
}
