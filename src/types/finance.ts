export type ExpenseCategory = 'fixed' | 'lifestyle' | 'installment';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  /** YYYY-MM format for the month this transaction starts */
  startMonth: string;
  installments?: {
    total: number;
    current: number;
    totalAmount: number;
  };
}

export interface CreditCard {
  id: string;
  name: string;
  invoiceAmount: number;
  dueDay: number;
}


export interface MonthData {
  /** YYYY-MM */
  month: string;
  income: number;
  transactions: Transaction[];
}

export interface FinanceState {
  months: Record<string, MonthData>;
  creditCards: CreditCard[];
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function addMonths(monthKey: string, offset: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return getMonthKey(date);
}
