// ═══════════════════════════════════════════════════════════════
//  SmartLab — API Service Layer
//  All communication with the Spring Boot backend lives here.
//  Components never call fetch() directly — they use these functions.
//
//  Base URL: http://localhost:8080/api
//  Change BASE_URL below if you deploy to a server.
// ═══════════════════════════════════════════════════════════════

const BASE_URL = "http://localhost:8081/api";

export const LAB_ID = 1; // Default lab — change if you add more labs

// ─── Shared fetch wrapper ───────────────────────────────────────
// Adds JSON headers, throws readable errors on non-2xx responses
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Network error" }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ═══════════════════════════════════════════════════════════════
//  COMPUTERS / LAB MAP
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/computers?labId=1
 * All 29 PCs with current status. Used to paint the floor map.
 * Returns: [{ id, pcNumber, rowName, side, status, updatedAt }, ...]
 */
export async function fetchComputers(labId = LAB_ID) {
  return request(`/computers?labId=${labId}`);
}

/**
 * GET /api/computers/stats?labId=1
 * Dashboard summary numbers for KPI cards.
 * Returns: { totalPcs, working, minor, faulty, offline,
 *             openIssues, inProgress, fixedToday, healthPercent }
 */
export async function fetchComputerStats(labId = LAB_ID) {
  return request(`/computers/stats?labId=${labId}`);
}

/**
 * PATCH /api/computers/{id}/status
 * Admin sets a PC's status directly.
 * @param {number} computerId  — database id of the computer
 * @param {string} status      — "WORKING" | "MINOR" | "FAULTY" | "OFFLINE"
 * @param {string} adminName   — logged for audit trail
 */
export async function updateComputerStatus(computerId, status, adminName = "Admin") {
  return request(`/computers/${computerId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminName }),
  });
}

// ═══════════════════════════════════════════════════════════════
//  ISSUES
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/issues
 * Student submits a new fault report.
 * @param {object} payload — { computerId, studentName, rollNumber,
 *                              issueType, severity, description }
 */
export async function reportIssue(payload) {
  return request("/issues", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/issues?labId=1
 * GET /api/issues?labId=1&status=OPEN
 * All issues for a lab, optionally filtered by status.
 * @param {string|null} status — "OPEN" | "IN_PROGRESS" | "FIXED" | "CLOSED" | null
 */
export async function fetchIssues(labId = LAB_ID, status = null) {
  const qs = status
    ? `/issues?labId=${labId}&status=${status}`
    : `/issues?labId=${labId}`;
  return request(qs);
}

/**
 * GET /api/issues/{id}
 */
export async function fetchIssueById(issueId) {
  return request(`/issues/${issueId}`);
}

/**
 * GET /api/issues/computer/{computerId}
 * All issues ever reported on one specific PC.
 */
export async function fetchIssuesByComputer(computerId) {
  return request(`/issues/computer/${computerId}`);
}

/**
 * PATCH /api/issues/{id}/status
 * Admin moves issue through lifecycle: OPEN → IN_PROGRESS → FIXED
 * @param {string} status      — "OPEN" | "IN_PROGRESS" | "FIXED" | "CLOSED"
 * @param {string} notes       — optional resolution notes
 * @param {string} resolvedBy  — admin name for audit trail
 */
export async function updateIssueStatus(issueId, status, notes = "", resolvedBy = "Admin") {
  return request(`/issues/${issueId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes, resolvedBy }),
  });
}

/**
 * GET /api/issues/activity
 * Last 20 activity log entries for admin dashboard feed.
 */
export async function fetchActivityLog() {
  return request("/issues/activity");
}

// ═══════════════════════════════════════════════════════════════
//  DATA TRANSFORM HELPERS
//  Convert between Spring Boot enum strings and frontend keys
// ═══════════════════════════════════════════════════════════════

/** "WORKING" → "ok"   |  "FAULTY" → "faulty"  etc. */
export function toFrontendStatus(s) {
  return { WORKING: "ok", MINOR: "minor", FAULTY: "faulty", OFFLINE: "offline" }[s] ?? "ok";
}

/** "ok" → "WORKING"   |  "faulty" → "FAULTY"  etc. */
export function toBackendStatus(s) {
  return { ok: "WORKING", minor: "MINOR", faulty: "FAULTY", offline: "OFFLINE" }[s] ?? "WORKING";
}

/** "IN_PROGRESS" → "prog"  |  "FIXED" → "fixed"  etc. */
export function toFrontendIssueStatus(s) {
  return { OPEN: "open", IN_PROGRESS: "prog", FIXED: "fixed", CLOSED: "closed" }[s] ?? "open";
}

/** "prog" → "IN_PROGRESS"  |  "fixed" → "FIXED"  etc. */
export function toBackendIssueStatus(s) {
  return { open: "OPEN", prog: "IN_PROGRESS", fixed: "FIXED", closed: "CLOSED" }[s] ?? "OPEN";
}

/** Integer 3 → "PC-03" */
export function pcLabel(n) {
  return `PC-${String(n).padStart(2, "0")}`;
}

/** "2026-03-19T09:42:00" → "09:42 AM" */
export function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

/** "2026-03-19T09:42:00" → "Today" | "Yesterday" | "19 Mar" */
export function formatDate(iso) {
  if (!iso) return "";
  const d    = new Date(iso);
  const diff = Math.floor((Date.now() - d) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
