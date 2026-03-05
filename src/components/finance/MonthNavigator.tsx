import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMonthLabel, addMonths } from '@/types/finance';

interface MonthNavigatorProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

export function MonthNavigator({ currentMonth, onMonthChange }: MonthNavigatorProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onMonthChange(addMonths(currentMonth, -1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h2 className="text-xl font-bold min-w-[200px] text-center">
        {formatMonthLabel(currentMonth)}
      </h2>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onMonthChange(addMonths(currentMonth, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
