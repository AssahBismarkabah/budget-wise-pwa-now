import { TFunction } from 'i18next';

/**
 * Format a number as a currency string (€)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

/**
 * Format a date as a localized string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE').format(date);
};

/**
 * Get the first day of the current month
 */
export const getFirstDayOfMonth = (): string => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
};

/**
 * Get the last day of the current month
 */
export const getLastDayOfMonth = (): string => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
};

/**
 * Format a month number to its name
 */
export function getMonthName(index: number, t: TFunction): string {
  const keys = [
    'month_january',
    'month_february',
    'month_march',
    'month_april',
    'month_may',
    'month_june',
    'month_july',
    'month_august',
    'month_september',
    'month_october',
    'month_november',
    'month_december',
  ];
  return t(keys[index]);
}

/**
 * Group transactions by date
 */
export const groupTransactionsByDate = (transactions: any[]) => {
  return transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(transaction);
    return groups;
  }, {});
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (current: number, target: number): number => {
  if (target <= 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(Math.max(0, percentage), 100);
};
