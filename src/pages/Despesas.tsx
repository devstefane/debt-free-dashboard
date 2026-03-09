import { useState } from 'react';
import { MonthNavigator } from '@/components/finance/MonthNavigator';
import { TransactionManager } from '@/components/finance/TransactionManager';
import { getMonthKey } from '@/types/finance';

const Despesas = () => {
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300">FinControl</p>
          <h1 className="text-4xl font-semibold mt-2">Despesas</h1>
        </div>
        <MonthNavigator currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <TransactionManager currentMonth={currentMonth} />
      </div>
    </div>
  );
};

export default Despesas;
