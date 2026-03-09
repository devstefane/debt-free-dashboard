import { useState } from 'react';
import { CheckCircle2, Clock3, Landmark, Plus, Wallet } from 'lucide-react';
import { MonthNavigator } from '@/components/finance/MonthNavigator';
import { getMonthKey } from '@/types/finance';
import { getMonthBills, getMonthIncome, useFinance } from '@/contexts/FinanceContext';

const money = (n: number) => `R$ ${n.toLocaleString('pt-BR')}`;

const Index = () => {
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date()));
  const { state } = useFinance();
  const monthBills = getMonthBills(state, currentMonth);

  const income = getMonthIncome(state, currentMonth);
  const total = monthBills.reduce((acc, item) => acc + item.amount, 0);
  const paid = monthBills.filter((item) => item.paid).reduce((acc, item) => acc + item.amount, 0);
  const pending = total - paid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300">FinControl</p>
          <h1 className="text-4xl font-semibold mt-2">Olá, seja bem-vindo ao seu FinControl.</h1>
        </div>
        <MonthNavigator currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          ['Renda Mensal', `+ ${money(income)}`, 'Restante'],
          ['Total de Contas', money(total), `${monthBills.length} contas`],
          ['Total Pago', money(paid), `${total ? Math.round((paid / total) * 100) : 0}% das contas`],
          ['Total Pendente', money(pending), `em ${monthBills.filter((b) => !b.paid).length} contas`],
        ].map((card, index) => (
          <div key={card[0]} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-slate-200 text-sm mb-2">
              {index === 0 && <Wallet className="h-4 w-4 text-emerald-300" />}
              {index === 1 && <Landmark className="h-4 w-4 text-slate-300" />}
              {index === 2 && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
              {index === 3 && <Clock3 className="h-4 w-4 text-rose-300" />}
              {card[0]}
            </div>
            <p className={`text-4xl font-semibold ${index === 3 ? 'text-rose-300' : 'text-emerald-300'}`}>{card[1]}</p>
            <p className="text-slate-400 text-sm mt-1">{card[2]}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-2xl font-medium mb-4">Contas de {currentMonth}</h2>
          <div className="space-y-2">
            {monthBills.slice(0, 6).map(({ bill, amount, paid, installmentLabel }) => (
              <div key={bill.id} className="flex items-center justify-between rounded-lg px-3 py-2 bg-black/20">
                <p>{bill.description}</p>
                <p className="text-slate-300">{installmentLabel ? `${installmentLabel} · ` : ''}{money(amount)}</p>
                <span className={`text-xs px-3 py-1 rounded-full ${paid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {paid ? 'Pago' : 'Pendente'}
                </span>
              </div>
            ))}
            {monthBills.length === 0 && <p className="text-slate-400">Cadastre despesas na aba "Despesas" para visualizar aqui.</p>}
          </div>
          <button className="mt-4 rounded-xl bg-emerald-500/70 hover:bg-emerald-500 px-4 py-2 text-sm inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Conta
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <h2 className="text-2xl font-medium">Análise Financeira</h2>
          <div className="h-44 rounded-full bg-[conic-gradient(#4ade80_0_72%,#ef4444_72%_100%)] w-44 mx-auto" />
          <p className="text-slate-300 text-sm">Você está comprometendo {income ? Math.round((total / income) * 100) : 0}% da sua renda.</p>
          <button className="rounded-xl bg-emerald-400/70 hover:bg-emerald-400 px-4 py-2 text-sm">Ver soluções</button>
        </div>
      </section>
    </div>
  );
};

export default Index;
