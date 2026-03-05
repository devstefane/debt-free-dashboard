import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { FinanceState, MonthData, Transaction, CreditCard, CreditCardExpense } from '@/types/finance';
import { addMonths } from '@/types/finance';

const STORAGE_KEY = 'finance-dashboard-data';

function loadState(): FinanceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        months: parsed.months || {},
        creditCards: parsed.creditCards || [],
        creditCardExpenses: parsed.creditCardExpenses || [],
      };
    }
  } catch {}
  return { months: {}, creditCards: [], creditCardExpenses: [] };
}

function saveState(state: FinanceState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type Action =
  | { type: 'SET_INCOME'; month: string; income: number }
  | { type: 'ADD_TRANSACTION'; month: string; transaction: Transaction }
  | { type: 'REMOVE_TRANSACTION'; month: string; transactionId: string }
  | { type: 'ADD_CREDIT_CARD'; card: CreditCard }
  | { type: 'REMOVE_CREDIT_CARD'; cardId: string }
  | { type: 'ADD_CARD_EXPENSE'; expense: CreditCardExpense }
  | { type: 'REMOVE_CARD_EXPENSE'; expenseId: string }
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
    case 'ADD_CREDIT_CARD':
      return { ...state, creditCards: [...state.creditCards, action.card] };
    case 'REMOVE_CREDIT_CARD':
      return {
        ...state,
        creditCards: state.creditCards.filter(c => c.id !== action.cardId),
        creditCardExpenses: state.creditCardExpenses.filter(e => e.cardId !== action.cardId),
      };
    case 'ADD_CARD_EXPENSE':
      return { ...state, creditCardExpenses: [...state.creditCardExpenses, action.expense] };
    case 'REMOVE_CARD_EXPENSE':
      return { ...state, creditCardExpenses: state.creditCardExpenses.filter(e => e.id !== action.expenseId) };
    case 'CLEAR_ALL':
      return { months: {}, creditCards: [], creditCardExpenses: [] };
    default:
      return state;
  }
}

/** Get all transactions for a given month, including projected installments */
export function getMonthTransactions(state: FinanceState, targetMonth: string): Transaction[] {
  const directTransactions = state.months[targetMonth]?.transactions || [];
  const projectedInstallments: Transaction[] = [];

  Object.values(state.months).forEach(monthData => {
    monthData.transactions.forEach(tx => {
      if (tx.category === 'installment' && tx.installments && tx.startMonth !== targetMonth) {
        const { total, current } = tx.installments;
        const [sy, sm] = tx.startMonth.split('-').map(Number);
        const [ty, tm] = targetMonth.split('-').map(Number);
        const diff = (ty - sy) * 12 + (tm - sm);
        const projectedCurrent = current + diff;

        if (projectedCurrent >= current && projectedCurrent <= total) {
          projectedInstallments.push({
            ...tx,
            id: `${tx.id}-proj-${targetMonth}`,
            installments: { ...tx.installments, current: projectedCurrent },
          });
        }
      }
    });
  });

  return [...directTransactions, ...projectedInstallments];
}

/** Get credit card expenses for a given month, including projected installments */
export function getCardExpensesForMonth(state: FinanceState, targetMonth: string, cardId?: string): CreditCardExpense[] {
  const result: CreditCardExpense[] = [];

  state.creditCardExpenses.forEach(expense => {
    if (cardId && expense.cardId !== cardId) return;

    if (!expense.installments) {
      if (expense.startMonth === targetMonth) result.push(expense);
      return;
    }

    const { total, current } = expense.installments;
    const [sy, sm] = expense.startMonth.split('-').map(Number);
    const [ty, tm] = targetMonth.split('-').map(Number);
    const diff = (ty - sy) * 12 + (tm - sm);
    const projectedCurrent = current + diff;

    if (projectedCurrent >= current && projectedCurrent <= total) {
      result.push({
        ...expense,
        id: diff === 0 ? expense.id : `${expense.id}-proj-${targetMonth}`,
        installments: { ...expense.installments, current: projectedCurrent },
      });
    }
  });

  return result;
}

export function getMonthIncome(state: FinanceState, month: string): number {
  return state.months[month]?.income || 0;
}

interface FinanceContextValue {
  state: FinanceState;
  setIncome: (month: string, income: number) => void;
  addTransaction: (month: string, tx: Transaction) => void;
  removeTransaction: (month: string, txId: string) => void;
  addCreditCard: (card: CreditCard) => void;
  removeCreditCard: (cardId: string) => void;
  addCardExpense: (expense: CreditCardExpense) => void;
  removeCardExpense: (expenseId: string) => void;
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
  const addCreditCard = useCallback((card: CreditCard) => {
    dispatch({ type: 'ADD_CREDIT_CARD', card });
  }, []);
  const removeCreditCard = useCallback((cardId: string) => {
    dispatch({ type: 'REMOVE_CREDIT_CARD', cardId });
  }, []);
  const addCardExpense = useCallback((expense: CreditCardExpense) => {
    dispatch({ type: 'ADD_CARD_EXPENSE', expense });
  }, []);
  const removeCardExpense = useCallback((expenseId: string) => {
    dispatch({ type: 'REMOVE_CARD_EXPENSE', expenseId });
  }, []);
  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  return (
    <FinanceContext.Provider value={{
      state, setIncome, addTransaction, removeTransaction,
      addCreditCard, removeCreditCard, addCardExpense, removeCardExpense, clearAll,
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
