export type BillType = 'fixed' | 'variable' | 'installment';

export interface Bill {
  id: string;
  description: string;
  type: BillType;
  /** For fixed and installment bills */
  amount?: number;
  /** YYYY-MM when this bill starts */
  startMonth: string;
  /** For installment bills */
  installmentTotal?: number;
  /** Whether this bill is still active (for fixed/variable) */
  active: boolean;
}

/** Per-month status for a bill */
export interface MonthBillEntry {
  billId: string;
  paid: boolean;
  /** For variable bills, user sets amount per month */
  amount?: number;
}

export interface CreditCard {
  id: string;
  name: string;
  invoiceAmount: number;
  dueDay: number;
}

export interface MonthData {
  month: string;
  income: number;
  billStatuses: MonthBillEntry[];
}

export interface FinanceState {
  bills: Bill[];
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

/** Calculate month difference: target - start */
export function monthDiff(startMonth: string, targetMonth: string): number {
  const [sy, sm] = startMonth.split('-').map(Number);
  const [ty, tm] = targetMonth.split('-').map(Number);
  return (ty - sy) * 12 + (tm - sm);
}
