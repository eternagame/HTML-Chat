export function formatDate(date: number | Date): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

export function formatTime(date: number | Date): string {
  return new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(date);
}
