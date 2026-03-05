import { useState } from 'react';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { MonthNavigator } from '@/components/finance/MonthNavigator';
import { SummaryCards } from '@/components/finance/SummaryCards';
import { TransactionManager } from '@/components/finance/TransactionManager';
import { FinanceCharts } from '@/components/finance/FinanceCharts';
import { getMonthKey } from '@/types/finance';
import { Landmark } from 'lucide-react';

function DashboardContent() {
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date()));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Landmark className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Controle Financeiro</h1>
          </div>
          <MonthNavigator currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <SummaryCards currentMonth={currentMonth} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TransactionManager currentMonth={currentMonth} />
          </div>
          <div className="lg:col-span-2">
            <FinanceCharts currentMonth={currentMonth} />
          </div>
        </div>
      </main>
    </div>
  );
}

const Index = () => (
  <FinanceProvider>
    <DashboardContent />
  </FinanceProvider>
);

export default Index;
