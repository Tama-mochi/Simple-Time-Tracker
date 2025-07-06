
export enum WorkStatus {
  NOT_STARTED,
  WORKING,
  PAUSED,
}

export interface TimeLog {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // in milliseconds
  pausedDuration: number; // in milliseconds
}
