
import { useState, useEffect, useCallback, useRef } from 'react';
import { WorkStatus } from '../types';
import { addLog } from '../services/timeLogService';
import type { TimeLog } from '../types';

const SESSION_STORAGE_KEY = 'timeTrackerSession';

interface TimeTrackerState {
  status: WorkStatus;
  startTime: number | null;
  pauseTime: number | null;
  pausedDuration: number;
}

export const useTimeTracker = () => {
  const [status, setStatus] = useState<WorkStatus>(WorkStatus.NOT_STARTED);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pauseTime, setPauseTime] = useState<number | null>(null);
  const [pausedDuration, setPausedDuration] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const intervalRef = useRef<number | null>(null);

  const saveSession = useCallback(() => {
    const session: TimeTrackerState = { status, startTime, pauseTime, pausedDuration };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [status, startTime, pauseTime, pausedDuration]);

  const clearSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };
  
  const loadSession = () => {
     try {
        const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (savedSession) {
            const session = JSON.parse(savedSession) as TimeTrackerState;
            setStatus(session.status);
            setStartTime(session.startTime);
            setPauseTime(session.pauseTime);
            setPausedDuration(session.pausedDuration);
        }
     } catch (e) {
        console.error("Failed to load session", e);
        clearSession();
     }
  };
  
  useEffect(() => {
    loadSession();
  }, []);


  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = useCallback(() => {
    stopTimer();
    intervalRef.current = window.setInterval(() => {
      if (startTime) {
        const now = Date.now();
        let currentPausedDuration = pausedDuration;
        if(status === WorkStatus.PAUSED && pauseTime) {
            currentPausedDuration += (now - pauseTime);
        }
        setElapsedTime(now - startTime - currentPausedDuration);
      }
    }, 1000);
  }, [startTime, pausedDuration, pauseTime, status]);

  useEffect(() => {
    if (status === WorkStatus.WORKING) {
      startTimer();
    } else {
      stopTimer();
    }
    
    if(status !== WorkStatus.NOT_STARTED) {
      saveSession();
    } else {
      clearSession();
    }

    // Recalculate time when status changes, e.g., on resume
    if (startTime) {
       setElapsedTime(Date.now() - startTime - pausedDuration);
    }


    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, startTimer, saveSession]);

  const startWork = () => {
    const now = Date.now();
    setStartTime(now);
    setStatus(WorkStatus.WORKING);
    setElapsedTime(0);
    setPausedDuration(0);
    setPauseTime(null);
  };

  const pauseWork = () => {
    if (status === WorkStatus.WORKING) {
      setPauseTime(Date.now());
      setStatus(WorkStatus.PAUSED);
      stopTimer();
    }
  };
  
  const resumeWork = () => {
    if (status === WorkStatus.PAUSED && pauseTime) {
      setPausedDuration(pausedDuration + (Date.now() - pauseTime));
      setPauseTime(null);
      setStatus(WorkStatus.WORKING);
    }
  };

  const endWork = () => {
    if (status === WorkStatus.WORKING || status === WorkStatus.PAUSED) {
      stopTimer();
      const endTime = new Date();
      const finalStartTime = new Date(startTime!);

      let finalPausedDuration = pausedDuration;
      if (status === WorkStatus.PAUSED && pauseTime) {
        finalPausedDuration += (endTime.getTime() - pauseTime);
      }

      const duration = endTime.getTime() - finalStartTime.getTime() - finalPausedDuration;

      const newLog: TimeLog = {
        id: crypto.randomUUID(),
        startTime: finalStartTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        pausedDuration: finalPausedDuration,
      };
      addLog(newLog);

      // Reset state
      setStatus(WorkStatus.NOT_STARTED);
      setStartTime(null);
      setPauseTime(null);
      setPausedDuration(0);
      setElapsedTime(0);
      clearSession();
    }
  };
  
  return { status, elapsedTime, startWork, pauseWork, resumeWork, endWork };
};
