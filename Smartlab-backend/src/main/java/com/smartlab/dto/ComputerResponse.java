package com.smartlab.dto;


import lombok.Data;
import java.time.LocalDateTime;
import com.smartlab.entity.Computer;



////─────────────────────────────────────────────
////RESPONSE: Computer with its open issue count
////
@Data
public class ComputerResponse {
    public Long id;
    public Integer pcNumber;
    public String pcLabel;              // "PC-03"
    public String rowName;
    public Computer.Side side;
    public Computer.Status status;
    public long openIssueCount;
    public LocalDateTime updatedAt;


}