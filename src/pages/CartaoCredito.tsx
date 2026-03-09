import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { MonthNavigator } from '@/components/finance/MonthNavigator';
import { getMonthKey } from '@/types/finance';
import { useFinance } from '@/contexts/FinanceContext';

const CartaoCredito = () => {
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date()));
  const { state } = useFinance();

  const total = state.creditCards.reduce((a, c) => a + c.invoiceAmount, 0);
  const paid = total * 0.52;
  const available = Math.max(4000 - total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300">FinControl</p>
          <h1 className="text-4xl font-semibold mt-2">Cartão de Crédito</h1>
        </div>
        <MonthNavigator currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>

      <button className="rounded-xl bg-emerald-500/80 px-4 py-2 inline-flex items-center gap-2"><Plus className="h-4 w-4"/>Adicionar Cartão</button>

      <div className="grid grid-cols-1 lg:grid-cols-4 rounded-2xl border border-white/10 bg-white/5 p-5 gap-3">
        <div className="lg:col-span-2">
          <p className="text-xl">Resumo de {currentMonth}</p>
          <div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-2 w-2/3 rounded-full bg-emerald-400" /></div>
        </div>
        <div><p className="text-slate-400">Total dos Cartões</p><p className="text-3xl font-semibold">R$ {total.toLocaleString('pt-BR')}</p></div>
        <div><p className="text-slate-400">Total Pago</p><p className="text-3xl font-semibold text-emerald-300">R$ {Math.round(paid).toLocaleString('pt-BR')}</p></div>
      </div>

      <div className="space-y-3">
        {state.creditCards.map((card, index) => (
          <div key={card.id} className="grid grid-cols-1 xl:grid-cols-4 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className={`rounded-2xl p-5 ${index % 2 === 0 ? 'bg-gradient-to-br from-violet-500 to-purple-700' : 'bg-gradient-to-br from-orange-500 to-rose-700'}`}>
              <p className="text-3xl font-semibold">{card.name}</p>
              <p className="mt-8 text-sm opacity-80">•••• {String(card.id).slice(-4)}</p>
            </div>
            <div className="xl:col-span-2 space-y-2 p-2">
              <p className="text-slate-400">Fatura Atual</p>
              <p className="text-4xl font-semibold">R$ {card.invoiceAmount.toLocaleString('pt-BR')}</p>
              <p className="text-slate-400">Vence dia {card.dueDay}</p>
              <button className="rounded-xl bg-emerald-500/60 px-3 py-1.5 text-sm">Marcar como Pago</button>
            </div>
            <div className="rounded-xl bg-black/20 p-4">
              <p className="text-slate-300">Limite Disponível</p>
              <p className="text-2xl text-emerald-300">R$ {available.toLocaleString('pt-BR')}</p>
              <div className="mt-2 flex items-center gap-1 text-emerald-300 text-sm"><Check className="h-4 w-4"/> Pago</div>
            </div>
          </div>
        ))}
        {state.creditCards.length === 0 && <p className="text-slate-400">Nenhum cartão cadastrado.</p>}
      </div>
    </div>
  );
};

export default CartaoCredito;
