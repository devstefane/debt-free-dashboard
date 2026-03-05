import { useState } from 'react';
import { MonthNavigator } from '@/components/finance/MonthNavigator';
import { TransactionManager } from '@/components/finance/TransactionManager';
import { getMonthKey } from '@/types/finance';

const Despesas = () => {
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Gerenciar Despesas</h1>
        <MonthNavigator currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>
      <TransactionManager currentMonth={currentMonth} />
    </div>
  );
};

export default Despesas;
