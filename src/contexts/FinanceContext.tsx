import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { FinanceState, MonthData, Bill, MonthBillEntry, CreditCard } from '@/types/finance';
import { monthDiff } from '@/types/finance';

const STORAGE_KEY = 'finance-dashboard-data';

function loadState(): FinanceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        bills: parsed.bills || [],
        months: parsed.months || {},
        creditCards: parsed.creditCards || [],
      };
    }
  } catch {}
  return { bills: [], months: {}, creditCards: [] };
}

function saveState(state: FinanceState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type Action =
  | { type: 'SET_INCOME'; month: string; income: number }
  | { type: 'ADD_BILL'; bill: Bill }
  | { type: 'REMOVE_BILL'; billId: string }
  | { type: 'TOGGLE_PAID'; month: string; billId: string }
  | { type: 'SET_VARIABLE_AMOUNT'; month: string; billId: string; amount: number }
  | { type: 'ADD_CREDIT_CARD'; card: CreditCard }
  | { type: 'REMOVE_CREDIT_CARD'; cardId: string }
  | { type: 'CLEAR_ALL' };

function ensureMonth(state: FinanceState, month: string): MonthData {
  return state.months[month] || { month, income: 0, billStatuses: [] };
}

function reducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {
    case 'SET_INCOME': {
      const existing = ensureMonth(state, action.month);
      return {
        ...state,
        months: { ...state.months, [action.month]: { ...existing, income: action.income } },
      };
    }
    case 'ADD_BILL':
      return { ...state, bills: [...state.bills, action.bill] };
    case 'REMOVE_BILL':
      return {
        ...state,
        bills: state.bills.filter(b => b.id !== action.billId),
        months: Object.fromEntries(
          Object.entries(state.months).map(([k, v]) => [
            k,
            { ...v, billStatuses: v.billStatuses.filter(s => s.billId !== action.billId) },
          ])
        ),
      };
    case 'TOGGLE_PAID': {
      const existing = ensureMonth(state, action.month);
      const idx = existing.billStatuses.findIndex(s => s.billId === action.billId);
      let newStatuses: MonthBillEntry[];
      if (idx >= 0) {
        newStatuses = existing.billStatuses.map((s, i) =>
          i === idx ? { ...s, paid: !s.paid } : s
        );
      } else {
        newStatuses = [...existing.billStatuses, { billId: action.billId, paid: true }];
      }
      return {
        ...state,
        months: { ...state.months, [action.month]: { ...existing, billStatuses: newStatuses } },
      };
    }
    case 'SET_VARIABLE_AMOUNT': {
      const existing = ensureMonth(state, action.month);
      const idx = existing.billStatuses.findIndex(s => s.billId === action.billId);
      let newStatuses: MonthBillEntry[];
      if (idx >= 0) {
        newStatuses = existing.billStatuses.map((s, i) =>
          i === idx ? { ...s, amount: action.amount } : s
        );
      } else {
        newStatuses = [...existing.billStatuses, { billId: action.billId, paid: false, amount: action.amount }];
      }
      return {
        ...state,
        months: { ...state.months, [action.month]: { ...existing, billStatuses: newStatuses } },
      };
    }
    case 'ADD_CREDIT_CARD':
      return { ...state, creditCards: [...state.creditCards, action.card] };
    case 'REMOVE_CREDIT_CARD':
      return { ...state, creditCards: state.creditCards.filter(c => c.id !== action.cardId) };
    case 'CLEAR_ALL':
      return { bills: [], months: {}, creditCards: [] };
    default:
      return state;
  }
}

/** Projected bill entry for a specific month */
export interface MonthBillView {
  bill: Bill;
  paid: boolean;
  amount: number;
  installmentLabel?: string; // e.g. "3/10"
}

/** Get all bills that apply to a given month with their status */
export function getMonthBills(state: FinanceState, targetMonth: string): MonthBillView[] {
  const monthData = state.months[targetMonth];
  const statuses = monthData?.billStatuses || [];
  const result: MonthBillView[] = [];

  for (const bill of state.bills) {
    if (!bill.active && bill.type !== 'installment') continue;
    const diff = monthDiff(bill.startMonth, targetMonth);
    if (diff < 0) continue;

    if (bill.type === 'fixed') {
      const status = statuses.find(s => s.billId === bill.id);
      result.push({
        bill,
        paid: status?.paid || false,
        amount: bill.amount || 0,
      });
    } else if (bill.type === 'variable') {
      const status = statuses.find(s => s.billId === bill.id);
      result.push({
        bill,
        paid: status?.paid || false,
        amount: status?.amount || 0,
      });
    } else if (bill.type === 'installment') {
      const total = bill.installmentTotal || 1;
      const currentInstallment = diff + 1;
      if (currentInstallment > total) continue;
      const status = statuses.find(s => s.billId === bill.id);
      result.push({
        bill,
        paid: status?.paid || false,
        amount: bill.amount || 0,
        installmentLabel: `${currentInstallment}/${total}`,
      });
    }
  }

  return result;
}

export function getMonthIncome(state: FinanceState, month: string): number {
  return state.months[month]?.income || 0;
}

interface FinanceContextValue {
  state: FinanceState;
  setIncome: (month: string, income: number) => void;
  addBill: (bill: Bill) => void;
  removeBill: (billId: string) => void;
  togglePaid: (month: string, billId: string) => void;
  setVariableAmount: (month: string, billId: string, amount: number) => void;
  addCreditCard: (card: CreditCard) => void;
  removeCreditCard: (cardId: string) => void;
  clearAll: () => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => { saveState(state); }, [state]);

  const setIncome = useCallback((month: string, income: number) => {
    dispatch({ type: 'SET_INCOME', month, income });
  }, []);
  const addBill = useCallback((bill: Bill) => {
    dispatch({ type: 'ADD_BILL', bill });
  }, []);
  const removeBill = useCallback((billId: string) => {
    dispatch({ type: 'REMOVE_BILL', billId });
  }, []);
  const togglePaid = useCallback((month: string, billId: string) => {
    dispatch({ type: 'TOGGLE_PAID', month, billId });
  }, []);
  const setVariableAmount = useCallback((month: string, billId: string, amount: number) => {
    dispatch({ type: 'SET_VARIABLE_AMOUNT', month, billId, amount });
  }, []);
  const addCreditCard = useCallback((card: CreditCard) => {
    dispatch({ type: 'ADD_CREDIT_CARD', card });
  }, []);
  const removeCreditCard = useCallback((cardId: string) => {
    dispatch({ type: 'REMOVE_CREDIT_CARD', cardId });
  }, []);
  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  return (
    <FinanceContext.Provider value={{
      state, setIncome, addBill, removeBill, togglePaid, setVariableAmount,
      addCreditCard, removeCreditCard, clearAll,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
