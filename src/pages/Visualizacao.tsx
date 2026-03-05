import { useState } from 'react';
import { MonthNavigator } from '@/components/finance/MonthNavigator';
import { SummaryCards } from '@/components/finance/SummaryCards';
import { FinanceCharts } from '@/components/finance/FinanceCharts';
import { useFinance, getMonthTransactions } from '@/contexts/FinanceContext';
import { getMonthKey } from '@/types/finance';

const categoryLabels: Record<string, string> = {
  fixed: 'Conta Fixa',
  lifestyle: 'Não Essencial',
  installment: 'Parcelado',
};

const Visualizacao = () => {
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date()));
  const { state } = useFinance();
  const monthTransactions = getMonthTransactions(state, currentMonth);

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Visualização</h1>
        <MonthNavigator currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>
      <SummaryCards currentMonth={currentMonth} />
      <FinanceCharts currentMonth={currentMonth} />

      {monthTransactions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Todas as despesas do mês</h2>
          <div className="grid gap-2">
            {monthTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card border"
              >
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {categoryLabels[t.category]}
                    {t.installments &&
                      ` · Parcela ${t.installments.current}/${t.installments.total}`}
                  </p>
                </div>
                <span className="font-semibold font-mono">{fmt(t.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualizacao;
