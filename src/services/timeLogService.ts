import type { TimeLog } from '../types';

const LOG_STORAGE_KEY = 'timeLogs';

export const getLogs = (): TimeLog[] => {
  try {
    const logsJson = localStorage.getItem(LOG_STORAGE_KEY);
    if (!logsJson) return [];
    const logs = JSON.parse(logsJson) as TimeLog[];
    // Sort by start time descending
    return logs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  } catch (error) {
    console.error("Failed to parse logs from localStorage", error);
    return [];
  }
};

export const addLog = (log: TimeLog): void => {
  const logs = getLogs();
  // getLogs already sorts, but let's re-sort after adding
  const updatedLogs = [...logs, log].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
};

export const updateLog = (updatedLog: TimeLog): void => {
  let logs = getLogs();
  const index = logs.findIndex(log => log.id === updatedLog.id);
  if (index !== -1) {
    logs[index] = updatedLog;
    // Ensure sorting is maintained after update
    logs = logs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  }
};

export const deleteLog = (logId: string): void => {
  const logs = getLogs();
  const updatedLogs = logs.filter(log => log.id !== logId);
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
};

export const clearLogs = (): void => {
  localStorage.removeItem(LOG_STORAGE_KEY);
};