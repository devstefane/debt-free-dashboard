import { DollarSign, TrendingDown, AlertTriangle, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance, getMonthBills, getMonthIncome } from '@/contexts/FinanceContext';
import { cn } from '@/lib/utils';

interface SummaryCardsProps {
  currentMonth: string;
}

export function SummaryCards({ currentMonth }: SummaryCardsProps) {
  const { state } = useFinance();
  const income = getMonthIncome(state, currentMonth);
  const bills = getMonthBills(state, currentMonth);

  const fixedTotal = bills.filter(b => b.bill.type === 'fixed').reduce((s, b) => s + b.amount, 0);
  const variableTotal = bills.filter(b => b.bill.type === 'variable').reduce((s, b) => s + b.amount, 0);
  const installmentTotal = bills.filter(b => b.bill.type === 'installment').reduce((s, b) => s + b.amount, 0);

  const totalExpenses = fixedTotal + variableTotal + installmentTotal;
  const committed = income > 0 ? ((fixedTotal + installmentTotal) / income) * 100 : 0;
  const balance = income - totalExpenses;
  const healthStatus = committed > 80 ? 'danger' : committed > 60 ? 'warning' : 'healthy';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Renda</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-primary">
            R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Despesas</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-destructive">
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
          <Wallet className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold font-mono", balance >= 0 ? "text-primary" : "text-destructive")}>
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card className={cn(
        "border-2",
        healthStatus === 'danger' && "border-destructive",
        healthStatus === 'warning' && "border-accent",
        healthStatus === 'healthy' && "border-primary"
      )}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saúde Financeira</CardTitle>
          <AlertTriangle className={cn("h-4 w-4",
            healthStatus === 'danger' && "text-destructive",
            healthStatus === 'warning' && "text-accent",
            healthStatus === 'healthy' && "text-primary"
          )} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold font-mono",
            healthStatus === 'danger' && "text-destructive",
            healthStatus === 'warning' && "text-accent",
            healthStatus === 'healthy' && "text-primary"
          )}>
            {committed.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {healthStatus === 'danger' ? 'Renda comprometida!' : healthStatus === 'warning' ? 'Atenção' : 'Saudável'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
