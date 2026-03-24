export function formatDate(date: number | Date): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

export function formatTime(date: number | Date): string {
  return new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(date);
}

export function formateDateTime(date: number | Date): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
