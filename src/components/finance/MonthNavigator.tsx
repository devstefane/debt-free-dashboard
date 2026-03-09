import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthLabel, addMonths } from '@/types/finance';

interface MonthNavigatorProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

export function MonthNavigator({ currentMonth, onMonthChange }: MonthNavigatorProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1">
      <button
        className="h-8 w-8 rounded-lg grid place-items-center text-slate-300 hover:bg-white/10"
        onClick={() => onMonthChange(addMonths(currentMonth, -1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <h2 className="text-lg font-medium min-w-[140px] text-center">{formatMonthLabel(currentMonth)}</h2>
      <button
        className="h-8 w-8 rounded-lg grid place-items-center text-slate-300 hover:bg-white/10"
        onClick={() => onMonthChange(addMonths(currentMonth, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
