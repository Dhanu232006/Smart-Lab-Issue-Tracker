package com.smartlab.dto;



import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.smartlab.entity.Computer;


////─────────────────────────────────────────────
////REQUEST: Admin updates a PC status
////
@Data
public class ComputerStatusRequest {
    @NotNull
    public Computer.Status status;
}
