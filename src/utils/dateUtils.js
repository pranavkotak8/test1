import { addDays, differenceInDays, format, isToday, isTomorrow, parseISO } from 'date-fns';

export function getTodayString() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function addDaysToDate(dateString, days) {
  const date = dateString ? parseISO(dateString) : new Date();
  return format(addDays(date, days), 'yyyy-MM-dd');
}

export function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = parseISO(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return differenceInDays(expiry, today);
}

export function getStatusFromExpiry(expiryDate, consumed = false) {
  if (consumed) return 'consumed';
  const daysLeft = getDaysUntilExpiry(expiryDate);
  if (daysLeft === null) return 'fresh';
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 3) return 'expiring_soon';
  return 'fresh';
}

export function formatDateDisplay(dateString) {
  if (!dateString) return 'N/A';
  const date = parseISO(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  const daysLeft = differenceInDays(date, today);
  if (daysLeft < 0) return `${Math.abs(daysLeft)}d ago`;
  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return 'Tomorrow';
  return `${daysLeft} days left`;
}

export function formatFullDate(dateString) {
  if (!dateString) return 'N/A';
  return format(parseISO(dateString), 'MMM d, yyyy');
}
