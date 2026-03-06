import { useState } from 'react';
import { MonthNavigator } from '@/components/finance/MonthNavigator';
import { SummaryCards } from '@/components/finance/SummaryCards';
import { FinanceCharts } from '@/components/finance/FinanceCharts';
import { useFinance, getMonthBills } from '@/contexts/FinanceContext';
import { getMonthKey } from '@/types/finance';

const typeLabels: Record<string, string> = {
  fixed: 'Conta Fixa',
  variable: 'Conta Variável',
  installment: 'Parcelado',
};

const Visualizacao = () => {
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date()));
  const { state } = useFinance();
  const monthBills = getMonthBills(state, currentMonth);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Visualização</h1>
        <MonthNavigator currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>
      <SummaryCards currentMonth={currentMonth} />
      <FinanceCharts currentMonth={currentMonth} />

      {monthBills.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Todas as contas do mês</h2>
          <div className="grid gap-2">
            {monthBills.map(({ bill, paid, amount, installmentLabel }) => (
              <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-card border">
                <div>
                  <p className="font-medium">{bill.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {typeLabels[bill.type]}
                    {installmentLabel && ` · Parcela ${installmentLabel}`}
                    {' · '}
                    <span className={paid ? 'text-primary' : 'text-destructive'}>
                      {paid ? 'Pago' : 'Não pago'}
                    </span>
                  </p>
                </div>
                <span className="font-semibold font-mono">{fmt(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualizacao;
