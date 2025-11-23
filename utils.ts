import { differenceInMinutes, format, isPast, parseISO } from 'date-fns';
import { Task } from './types';

export const formatDateDisplay = (isoDate: string, language: string): { text: string; isOverdue: boolean } => {
  if (!isoDate) return { text: '', isOverdue: false };
  
  const date = parseISO(isoDate);
  const now = new Date();
  
  if (isPast(date)) {
    return { text: format(date, "PPp"), isOverdue: true };
  } else {
    return { text: format(date, "PPp"), isOverdue: false };
  }
};

export const exportTasks = (tasks: Task[]) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "tasks_" + new Date().toISOString() + ".json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const handleShare = async (title: string, text: string) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  } else {
    alert('Web Share API not supported in this browser. Copied to clipboard!');
    navigator.clipboard.writeText(`${title}\n${text}`);
  }
};
