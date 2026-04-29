-- ═══════════════════════════════════════════════════════
--  SmartLab Issue Tracker — MySQL Database Schema
--  Run this file once to set up the database
-- ═══════════════════════════════════════════════════════

-- 1. Create and use the database
CREATE DATABASE IF NOT EXISTS smartlab_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartlab_db;

-- ─────────────────────────────────────────────
--  TABLE: labs
--  Stores each computer lab in the institution
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS labs (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  lab_name    VARCHAR(100)  NOT NULL,
  block       VARCHAR(50)   NOT NULL,
  department  VARCHAR(150)  NOT NULL,
  total_pcs   INT           NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────
--  TABLE: computers
--  One row per physical PC in a lab
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS computers (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  lab_id      BIGINT        NOT NULL,
  pc_number   INT           NOT NULL,           -- 1..29
  row_name    VARCHAR(10)   NOT NULL,           -- e.g. "ROW1", "ROW4"
  side        ENUM('LEFT','RIGHT') NOT NULL,
  status      ENUM('WORKING','MINOR','FAULTY','OFFLINE')
                            NOT NULL DEFAULT 'WORKING',
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lab_pc (lab_id, pc_number),
  CONSTRAINT fk_computers_lab FOREIGN KEY (lab_id)
    REFERENCES labs(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  TABLE: issues
--  Every fault report submitted by students
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS issues (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  computer_id     BIGINT        NOT NULL,
  student_name    VARCHAR(150)  NOT NULL,
  roll_number     VARCHAR(50)   NOT NULL,
  issue_type      VARCHAR(100)  NOT NULL,       -- e.g. "Not Booting"
  severity        ENUM('MINOR','MEDIUM','HIGH','CRITICAL')
                                NOT NULL DEFAULT 'MEDIUM',
  description     TEXT,
  status          ENUM('OPEN','IN_PROGRESS','FIXED','CLOSED')
                                NOT NULL DEFAULT 'OPEN',
  reported_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at     DATETIME      NULL,
  resolved_by     VARCHAR(150)  NULL,
  notes           TEXT          NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_issues_computer FOREIGN KEY (computer_id)
    REFERENCES computers(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  TABLE: activity_log
--  Audit trail of every status change
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  issue_id    BIGINT        NULL,
  computer_id BIGINT        NULL,
  action      VARCHAR(255)  NOT NULL,           -- human-readable message
  performed_by VARCHAR(150) NOT NULL DEFAULT 'System',
  performed_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────
--  INDEXES for faster queries
-- ─────────────────────────────────────────────
CREATE INDEX idx_issues_status      ON issues(status);
CREATE INDEX idx_issues_computer    ON issues(computer_id);
CREATE INDEX idx_issues_reported_at ON issues(reported_at);
CREATE INDEX idx_computers_lab      ON computers(lab_id);
CREATE INDEX idx_computers_status   ON computers(status);

-- ═══════════════════════════════════════════════════════
--  SEED DATA
-- ═══════════════════════════════════════════════════════

-- Insert lab
INSERT INTO labs (lab_name, block, department, total_pcs)
VALUES ('Lab 3', 'Block B', 'Department of Computer Science', 29);

-- Insert all 29 computers (matching your exact blueprint layout)
-- Row 1: PC 1-4 LEFT, PC 5-8 RIGHT
INSERT INTO computers (lab_id, pc_number, row_name, side, status) VALUES
(1,  1, 'ROW1', 'LEFT',  'MINOR'),
(1,  2, 'ROW1', 'LEFT',  'WORKING'),
(1,  3, 'ROW1', 'LEFT',  'FAULTY'),
(1,  4, 'ROW1', 'LEFT',  'WORKING'),
(1,  5, 'ROW1', 'RIGHT', 'WORKING'),
(1,  6, 'ROW1', 'RIGHT', 'MINOR'),
(1,  7, 'ROW1', 'RIGHT', 'WORKING'),
(1,  8, 'ROW1', 'RIGHT', 'WORKING'),
-- Row 2: PC 9-12 LEFT, PC 13-16 RIGHT
(1,  9, 'ROW2', 'LEFT',  'WORKING'),
(1, 10, 'ROW2', 'LEFT',  'WORKING'),
(1, 11, 'ROW2', 'LEFT',  'WORKING'),
(1, 12, 'ROW2', 'LEFT',  'WORKING'),
(1, 13, 'ROW2', 'RIGHT', 'FAULTY'),
(1, 14, 'ROW2', 'RIGHT', 'WORKING'),
(1, 15, 'ROW2', 'RIGHT', 'WORKING'),
(1, 16, 'ROW2', 'RIGHT', 'WORKING'),
-- Row 3: PC 17-20 LEFT, PC 21-24 RIGHT
(1, 17, 'ROW3', 'LEFT',  'WORKING'),
(1, 18, 'ROW3', 'LEFT',  'WORKING'),
(1, 19, 'ROW3', 'LEFT',  'WORKING'),
(1, 20, 'ROW3', 'LEFT',  'FAULTY'),
(1, 21, 'ROW3', 'RIGHT', 'WORKING'),
(1, 22, 'ROW3', 'RIGHT', 'MINOR'),
(1, 23, 'ROW3', 'RIGHT', 'WORKING'),
(1, 24, 'ROW3', 'RIGHT', 'WORKING'),
-- Row 4: PC 25-28 LEFT, PC 29 RIGHT (under PC 21)
(1, 25, 'ROW4', 'LEFT',  'WORKING'),
(1, 26, 'ROW4', 'LEFT',  'WORKING'),
(1, 27, 'ROW4', 'LEFT',  'WORKING'),
(1, 28, 'ROW4', 'LEFT',  'WORKING'),
(1, 29, 'ROW4', 'RIGHT', 'WORKING');

-- Insert sample issues
INSERT INTO issues (computer_id, student_name, roll_number, issue_type, severity, description, status) VALUES
(3,  'Ravi Kumar',   '22CS047', 'Not Booting', 'CRITICAL', 'System stuck at BIOS screen on every boot',   'IN_PROGRESS'),
(13, 'Priya Sharma', '22CS061', 'Keyboard',    'HIGH',     'Keyboard not responding at all',              'OPEN'),
(20, 'Arjun Nair',   '22CS033', 'No Internet', 'MEDIUM',   'No internet connectivity since morning',      'OPEN'),
(1,  'Meena Iyer',   '22CS019', 'Mouse',       'MINOR',    'Mouse cursor jumps randomly across screen',   'OPEN'),
(6,  'Suresh Babu',  '22CS072', 'Display',     'HIGH',     'Monitor flickering on startup',               'FIXED');

-- Insert sample activity log
INSERT INTO activity_log (issue_id, computer_id, action, performed_by) VALUES
(1, 3,  'Issue ISS-001 reported for PC-03 — Not Booting (CRITICAL)', 'System'),
(2, 13, 'Issue ISS-002 reported for PC-13 — Keyboard (HIGH)',        'System'),
(3, 20, 'Issue ISS-003 reported for PC-20 — No Internet (MEDIUM)',   'System'),
(4, 1,  'Issue ISS-004 reported for PC-01 — Mouse (MINOR)',          'System'),
(5, 6,  'Issue ISS-005 reported for PC-06 — Display (HIGH)',         'System'),
(1, 3,  'Issue ISS-001 status changed to IN_PROGRESS',               'Admin'),
(5, 6,  'Issue ISS-005 resolved — Monitor cable reseated',           'Admin'),
(5, 6,  'PC-06 status updated to WORKING',                           'Admin');
