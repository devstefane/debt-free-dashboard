import { useState } from 'react';
import { MonthNavigator } from '@/components/finance/MonthNavigator';
import { getMonthKey } from '@/types/finance';
import { getMonthBills, getMonthIncome, useFinance } from '@/contexts/FinanceContext';

const Solucoes = () => {
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date()));
  const { state } = useFinance();
  const bills = getMonthBills(state, currentMonth);
  const income = getMonthIncome(state, currentMonth);
  const total = bills.reduce((a, b) => a + b.amount, 0);
  const score = Math.max(0, 100 - Math.round((total / (income || 1)) * 100));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300">FinControl</p>
          <h1 className="text-4xl font-semibold mt-2">Soluções Financeiras</h1>
        </div>
        <MonthNavigator currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-2xl mb-3">Diagnóstico Financeiro</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-lg">
              <p>Renda mensal: <strong>R$ {income.toLocaleString('pt-BR')}</strong></p>
              <p>Gastos totais: <strong>R$ {total.toLocaleString('pt-BR')}</strong></p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-2xl mb-3">Estratégia recomendada pela IA</h2>
            <ul className="space-y-2 text-slate-200">
              <li>• Cortar Delivery e Streaming por 3 meses.</li>
              <li>• Direcionar economia para quitação de dívidas.</li>
              <li>• Reservar 10% da renda para emergência.</li>
            </ul>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-xl">Assistente Financeiro</h3>
            <p className="text-4xl font-semibold mt-3">{score} / 100</p>
            <div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-amber-300" style={{ width: `${Math.max(score, 8)}%` }} /></div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-slate-300">Economia potencial:</p>
            <p className="text-4xl font-semibold text-amber-200 mt-2">R$ 500 por mês</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solucoes;
