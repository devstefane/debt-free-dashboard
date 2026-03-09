import { useState } from 'react';
import { MonthNavigator } from '@/components/finance/MonthNavigator';
import { getMonthKey } from '@/types/finance';
import { getMonthBills, useFinance } from '@/contexts/FinanceContext';

const categories = ['Cartão de Crédito', 'Mercado', 'Parcelados', 'Alimentação', 'Outros'];

const Visualizacao = () => {
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date()));
  const { state } = useFinance();
  const bills = getMonthBills(state, currentMonth);
  const total = bills.reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300">FinControl</p>
          <h1 className="text-4xl font-semibold mt-2">Visão Geral</h1>
        </div>
        <MonthNavigator currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-2xl">Distribuição dos Gastos</h2>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            <div className="h-56 w-56 rounded-full mx-auto bg-[conic-gradient(#86efac_0_30%,#60a5fa_30%_53%,#fbbf24_53%_71%,#fb923c_71%_86%,#f87171_86%_100%)]" />
            <ul className="space-y-2">
              {categories.map((c, i) => (
                <li key={c} className="flex justify-between border-b border-white/10 pb-2"><span>{i + 1}. {c}</span><span>R$ {Math.round((total || 1000) / (i + 2)).toLocaleString('pt-BR')}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-xl">Análise do FinControl</h3>
            <p className="text-sm text-slate-300 mt-3">Reduza gastos com compras online e streaming para equilibrar o orçamento.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-xl">Saúde Financeira</h3>
            <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 w-4/5 rounded-full bg-emerald-400" /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizacao;
