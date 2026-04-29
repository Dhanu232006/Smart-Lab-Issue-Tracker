// ═══════════════════════════════════════════════════════════════
//  SmartLab — Custom React Hooks
//  Each hook talks to the backend via api.js and returns
//  { data, loading, error, refresh } so components stay clean.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchComputers,
  fetchIssues,
  fetchComputerStats,
  fetchActivityLog,
  updateIssueStatus    as apiUpdateIssueStatus,
  updateComputerStatus as apiUpdateComputerStatus,
  reportIssue          as apiReportIssue,
  toFrontendStatus,
  toBackendStatus,
  toFrontendIssueStatus,
  toBackendIssueStatus,
  LAB_ID,
} from "./api";

// ─────────────────────────────────────────────
//  useLabMap
//  Loads all computers, converts array → map keyed by pcNumber.
//  Auto-polls every 30 s so the map stays live during a session.
//
//  Returns:
//    computers   — { [pcNumber]: { id, status, frontendStatus, ... } }
//    loading     — true on first load
//    error       — string or null
//    refresh     — function to manually reload
//    optimisticUpdate(pcNumber, frontendStatus) — instant UI update
//                                                 before server confirms
// ─────────────────────────────────────────────
export function useLabMap(labId = LAB_ID) {
  const [computers, setComputers] = useState({});
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchComputers(labId);
      const map  = {};
      data.forEach(pc => {
        map[pc.pcNumber] = {
          ...pc,
          frontendStatus: toFrontendStatus(pc.status),
        };
      });
      setComputers(map);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 30_000); // poll every 30 s
    return () => clearInterval(timerRef.current);
  }, [load]);

  const optimisticUpdate = useCallback((pcNumber, newFrontendStatus) => {
    setComputers(prev => ({
      ...prev,
      [pcNumber]: {
        ...prev[pcNumber],
        frontendStatus: newFrontendStatus,
        status: toBackendStatus(newFrontendStatus),
      },
    }));
  }, []);

  return { computers, loading, error, refresh: load, optimisticUpdate };
}

// ─────────────────────────────────────────────
//  useIssues
//  All issues for a lab with optional status filter.
//  Normalises backend status strings to frontend tag keys.
//
//  Usage:
//    const { issues, loading, refresh } = useIssues();
//    const { issues } = useIssues(LAB_ID, "OPEN");
// ─────────────────────────────────────────────
export function useIssues(labId = LAB_ID, statusFilter = null) {
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchIssues(labId, statusFilter);
      setIssues(
        data.map(i => ({
          ...i,
          frontendStatus: toFrontendIssueStatus(i.status),
          pcLabel: i.pcLabel,
        }))
      );
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [labId, statusFilter]);

  useEffect(() => { load(); }, [load]);

  return { issues, setIssues, loading, error, refresh: load };
}

// ─────────────────────────────────────────────
//  useDashboardStats
//  KPI numbers for admin overview.
//  Refreshes every 60 s.
//
//  Returns stats: { working, minor, faulty, offline,
//                   openIssues, inProgress, fixedToday, healthPercent }
// ─────────────────────────────────────────────
export function useDashboardStats(labId = LAB_ID) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchComputerStats(labId);
      setStats(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  return { stats, loading, error, refresh: load };
}

// ─────────────────────────────────────────────
//  useActivityLog
//  Last 20 activity entries for admin dashboard feed.
//  Polls every 30 s.
// ─────────────────────────────────────────────
export function useActivityLog() {
  const [log,     setLog]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchActivityLog();
      setLog(data);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  return { log, loading, refresh: load };
}

// ─────────────────────────────────────────────
//  useReportIssue
//  Manages the student issue submission.
//  Returns a submit function + loading/success/error states.
//
//  Usage in SmartLabTracker.jsx:
//    const { submit, submitting, success, error } = useReportIssue(onDone);
//
//    await submit({
//      computerId, studentName, rollNumber,
//      issueType, severity, description
//    });
// ─────────────────────────────────────────────
export function useReportIssue(onSuccess) {
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState(null);

  const submit = useCallback(async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await apiReportIssue(payload);
      setSuccess(true);
      if (onSuccess) onSuccess(created);
      return created;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, [onSuccess]);

  const reset = useCallback(() => {
    setSuccess(false);
    setError(null);
  }, []);

  return { submit, submitting, success, error, reset };
}

// ─────────────────────────────────────────────
//  useIssueActions
//  Admin actions: change issue status, change PC status.
//  Per-action loading map so each table row shows its own spinner.
//
//  Usage in AdminDashboard.jsx:
//    const { updateIssue, updatePC, actionLoading } = useIssueActions(refresh);
//
//    updateIssue(issueId, "prog");          // → IN_PROGRESS
//    updateIssue(issueId, "fixed", "notes replaced RAM", "Admin");
//    updatePC(computerId, "ok");            // → WORKING
// ─────────────────────────────────────────────
export function useIssueActions(onDone) {
  const [actionLoading, setActionLoading] = useState({});
  const [error,         setError]         = useState(null);

  const setKey = (key, val) =>
    setActionLoading(prev => ({ ...prev, [key]: val }));

  const updateIssue = useCallback(async (
    issueId, frontendTag, notes = "", resolvedBy = "Admin"
  ) => {
    const key = `issue-${issueId}`;
    setKey(key, true);
    setError(null);
    try {
      await apiUpdateIssueStatus(
        issueId,
        toBackendIssueStatus(frontendTag),
        notes,
        resolvedBy
      );
      if (onDone) onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setKey(key, false);
    }
  }, [onDone]);

  const updatePC = useCallback(async (
    computerId, frontendStatus, adminName = "Admin"
  ) => {
    const key = `pc-${computerId}`;
    setKey(key, true);
    setError(null);
    try {
      await apiUpdateComputerStatus(
        computerId,
        toBackendStatus(frontendStatus),
        adminName
      );
      if (onDone) onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setKey(key, false);
    }
  }, [onDone]);

  return { updateIssue, updatePC, actionLoading, error };
}
