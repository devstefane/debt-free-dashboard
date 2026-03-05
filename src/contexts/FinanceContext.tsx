import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { FinanceState, MonthData, Transaction, ExpenseCategory } from '@/types/finance';
import { addMonths } from '@/types/finance';

const STORAGE_KEY = 'finance-dashboard-data';

function loadState(): FinanceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { months: {} };
}

function saveState(state: FinanceState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type Action =
  | { type: 'SET_INCOME'; month: string; income: number }
  | { type: 'ADD_TRANSACTION'; month: string; transaction: Transaction }
  | { type: 'REMOVE_TRANSACTION'; month: string; transactionId: string }
  | { type: 'CLEAR_ALL' };

function ensureMonth(state: FinanceState, month: string): MonthData {
  return state.months[month] || { month, income: 0, transactions: [] };
}

function reducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {
    case 'SET_INCOME': {
      const existing = ensureMonth(state, action.month);
      return {
        ...state,
        months: {
          ...state.months,
          [action.month]: { ...existing, income: action.income },
        },
      };
    }
    case 'ADD_TRANSACTION': {
      const existing = ensureMonth(state, action.month);
      return {
        ...state,
        months: {
          ...state.months,
          [action.month]: {
            ...existing,
            transactions: [...existing.transactions, action.transaction],
          },
        },
      };
    }
    case 'REMOVE_TRANSACTION': {
      const existing = ensureMonth(state, action.month);
      return {
        ...state,
        months: {
          ...state.months,
          [action.month]: {
            ...existing,
            transactions: existing.transactions.filter(t => t.id !== action.transactionId),
          },
        },
      };
    }
    case 'CLEAR_ALL':
      return { months: {} };
    default:
      return state;
  }
}

/** Get all transactions for a given month, including projected installments */
export function getMonthTransactions(state: FinanceState, targetMonth: string): Transaction[] {
  const directTransactions = state.months[targetMonth]?.transactions || [];
  const projectedInstallments: Transaction[] = [];

  // Scan all months for installment transactions that project into targetMonth
  Object.values(state.months).forEach(monthData => {
    monthData.transactions.forEach(tx => {
      if (tx.category === 'installment' && tx.installments && tx.startMonth !== targetMonth) {
        const { total, current } = tx.installments;
        // Calculate how many months from startMonth to targetMonth
        const [sy, sm] = tx.startMonth.split('-').map(Number);
        const [ty, tm] = targetMonth.split('-').map(Number);
        const diff = (ty - sy) * 12 + (tm - sm);
        const projectedCurrent = current + diff;

        if (projectedCurrent >= current && projectedCurrent <= total) {
          projectedInstallments.push({
            ...tx,
            id: `${tx.id}-proj-${targetMonth}`,
            installments: {
              ...tx.installments,
              current: projectedCurrent,
            },
          });
        }
      }
    });
  });

  return [...directTransactions, ...projectedInstallments];
}

export function getMonthIncome(state: FinanceState, month: string): number {
  return state.months[month]?.income || 0;
}

interface FinanceContextValue {
  state: FinanceState;
  setIncome: (month: string, income: number) => void;
  addTransaction: (month: string, tx: Transaction) => void;
  removeTransaction: (month: string, txId: string) => void;
  clearAll: () => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setIncome = useCallback((month: string, income: number) => {
    dispatch({ type: 'SET_INCOME', month, income });
  }, []);

  const addTransaction = useCallback((month: string, tx: Transaction) => {
    dispatch({ type: 'ADD_TRANSACTION', month, transaction: tx });
  }, []);

  const removeTransaction = useCallback((month: string, txId: string) => {
    dispatch({ type: 'REMOVE_TRANSACTION', month, transactionId: txId });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  return (
    <FinanceContext.Provider value={{ state, setIncome, addTransaction, removeTransaction, clearAll }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
