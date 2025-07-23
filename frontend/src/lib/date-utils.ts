// src/lib/date-utils.ts
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatDate = (date: string | Date, formatStr: string = 'PPP') => {
  return format(new Date(date), formatStr);
};

export const formatRelativeDate = (date: string | Date) => {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
};