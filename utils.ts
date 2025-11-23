
import { differenceInMinutes, format, isPast, parseISO } from 'date-fns';
import { Task, Language } from './types';
import { TRANSLATIONS } from './constants';

export const formatDateDisplay = (isoDate: string, language: Language): { text: string; isOverdue: boolean; timeLeft: string } => {
  if (!isoDate) return { text: '', isOverdue: false, timeLeft: '' };
  
  const date = parseISO(isoDate);
  const now = new Date();
  const t = TRANSLATIONS[language];
  
  let timeLeft = '';
  
  // Calculate Time Left if not passed
  if (!isPast(date)) {
    const diffInMinutes = differenceInMinutes(date, now);
    const days = Math.floor(diffInMinutes / (60 * 24));
    const hours = Math.floor((diffInMinutes % (60 * 24)) / 60);
    const minutes = diffInMinutes % 60;

    if (days > 0) {
      timeLeft = t.daysLeft.replace('{n}', days.toString());
    } else if (hours > 0) {
      timeLeft = t.hoursLeft.replace('{n}', hours.toString());
    } else if (minutes >= 0) {
      timeLeft = t.minutesLeft.replace('{n}', minutes.toString());
    }
  }
  
  if (isPast(date)) {
    return { text: format(date, "PPp"), isOverdue: true, timeLeft: '' };
  } else {
    return { text: format(date, "PPp"), isOverdue: false, timeLeft };
  }
};

export const exportTasks = (tasks: Task[], format: 'json' | 'csv' = 'json') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (format === 'json') {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    downloadFile(dataStr, `tasks_${timestamp}.json`);
  } else {
    // CSV Export
    const headers = ['Subject', 'Description', 'Due Date', 'Completed', 'Flag Color', 'Created At'];
    
    const csvRows = tasks.map(task => {
      return [
        escapeCsvCell(task.subject),
        escapeCsvCell(task.description),
        task.dueDate || '',
        task.completed ? 'Yes' : 'No',
        task.flagColor || '',
        new Date(task.createdAt).toISOString()
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    downloadFile(dataStr, `tasks_${timestamp}.csv`);
  }
};

const escapeCsvCell = (text: string) => {
  if (!text) return '""';
  // Escape double quotes by doubling them, and wrap the field in quotes
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadFile = (dataStr: string, fileName: string) => {
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", fileName);
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
