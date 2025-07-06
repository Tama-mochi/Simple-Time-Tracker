export const formatDuration = (ms: number): string => {
  if (ms < 0) ms = 0;

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, '0'))
    .join(':');
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatToDateTimeLocal = (dateString: string): string => {
    const date = new Date(dateString);
    // Adjust for timezone offset to display correctly in local time input
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
};

export const parseDuration = (durationString: string): number => {
    const parts = durationString.split(':').map(part => parseInt(part, 10) || 0);
    if (parts.length !== 3) return 0;
    const [hours, minutes, seconds] = parts;
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
};

export const formatYearMonth = (yearMonth: string): string => { // e.g., "2023-10"
  if (!yearMonth || !yearMonth.includes('-')) return '';
  const [year, month] = yearMonth.split('-');
  return `${year}年${parseInt(month, 10)}月`;
};