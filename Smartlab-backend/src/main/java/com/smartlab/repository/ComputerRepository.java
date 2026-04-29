package com.smartlab.repository;



import org.springframework.data.jpa.repository.JpaRepository;

import com.smartlab.entity.Computer;

import java.util.List;
import java.util.Optional;

public interface ComputerRepository extends JpaRepository<Computer, Long> {

    List<Computer> findByLabIdOrderByPcNumber(Long labId);

    List<Computer> findByLabIdAndStatus(Long labId, Computer.Status status);

    long countByLabIdAndStatus(Long labId, Computer.Status status);

    Optional<Computer> findByLabIdAndPcNumber(Long labId, Integer pcNumber);
}
