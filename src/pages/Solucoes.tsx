import { useState, useMemo } from 'react';
import { Lightbulb, TrendingDown, ArrowDownUp, Calculator, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance, getMonthTransactions, getMonthIncome } from '@/contexts/FinanceContext';
import { getMonthKey, formatMonthLabel, addMonths } from '@/types/finance';
import { cn } from '@/lib/utils';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Solucoes = () => {
  const { state } = useFinance();
  const currentMonth = getMonthKey(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Lightbulb className="h-6 w-6 text-accent" />
        <h1 className="text-2xl font-bold">Soluções Inteligentes</h1>
      </div>

      <Tabs defaultValue="tips" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="tips">Dicas</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="priority">Priorização</TabsTrigger>
        </TabsList>

        <TabsContent value="tips">
          <SmartTips currentMonth={currentMonth} />
        </TabsContent>
        <TabsContent value="simulator">
          <DebtSimulator />
        </TabsContent>
        <TabsContent value="priority">
          <DebtPriority currentMonth={currentMonth} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function SmartTips({ currentMonth }: { currentMonth: string }) {
  const { state } = useFinance();
  const income = getMonthIncome(state, currentMonth);
  const transactions = getMonthTransactions(state, currentMonth);
  const cardTotal = state.creditCards.reduce((s, c) => s + c.invoiceAmount, 0);

  const tips = useMemo(() => {
    const result: { type: 'danger' | 'warning' | 'success'; icon: typeof AlertTriangle; text: string }[] = [];

    const fixedTotal = transactions.filter(t => t.category === 'fixed').reduce((s, t) => s + t.amount, 0);
    const lifestyleTotal = transactions.filter(t => t.category === 'lifestyle').reduce((s, t) => s + t.amount, 0);
    const installmentTotal = transactions
      .filter(t => t.category === 'installment')
      .reduce((s, t) => s + (t.installments ? t.installments.totalAmount / t.installments.total : t.amount), 0);
    const totalExpenses = fixedTotal + lifestyleTotal + installmentTotal + cardTotal;

    if (income === 0) {
      result.push({ type: 'warning', icon: AlertTriangle, text: 'Defina sua renda mensal para receber dicas personalizadas.' });
      return result;
    }

    const committed = ((fixedTotal + installmentTotal + cardTotal) / income) * 100;

    if (committed > 80) {
      result.push({ type: 'danger', icon: Flame, text: `🚨 Sua renda está ${committed.toFixed(0)}% comprometida com fixos e parcelas. Considere renegociar dívidas urgentemente.` });
    } else if (committed > 60) {
      result.push({ type: 'warning', icon: AlertTriangle, text: `⚠️ ${committed.toFixed(0)}% da sua renda já está comprometida. Evite novos parcelamentos.` });
    } else {
      result.push({ type: 'success', icon: CheckCircle2, text: `✅ Saúde financeira boa! ${committed.toFixed(0)}% comprometido. Continue assim.` });
    }

    if (lifestyleTotal > 0 && income > 0) {
      const lifestylePercent = (lifestyleTotal / income) * 100;
      if (lifestylePercent > 30) {
        result.push({
          type: 'warning',
          icon: TrendingDown,
          text: `Gastos não essenciais representam ${lifestylePercent.toFixed(0)}% da renda (${fmt(lifestyleTotal)}). Cortando pela metade, você economizaria ${fmt(lifestyleTotal / 2)}/mês.`,
        });
      }
    }

    if (totalExpenses > income) {
      result.push({
        type: 'danger',
        icon: AlertTriangle,
        text: `Suas despesas (${fmt(totalExpenses)}) superam a renda (${fmt(income)}) em ${fmt(totalExpenses - income)}. Você está se endividando!`,
      });
    }

    const balance = income - totalExpenses;
    if (balance > 0 && balance < income * 0.1) {
      result.push({
        type: 'warning',
        icon: AlertTriangle,
        text: `Sua margem de segurança é de apenas ${fmt(balance)} (${((balance / income) * 100).toFixed(0)}%). Ideal: pelo menos 20%.`,
      });
    }

    // Check future months for installment pile-up
    let maxFutureCommit = 0;
    let worstMonth = '';
    for (let i = 1; i <= 6; i++) {
      const futureMonth = addMonths(currentMonth, i);
      const futureTx = getMonthTransactions(state, futureMonth);
      const futureTotal = futureTx.reduce((s, t) => s + t.amount, 0) + state.creditCards.reduce((s, c) => s + c.invoiceAmount, 0);
      if (futureTotal > maxFutureCommit) {
        maxFutureCommit = futureTotal;
        worstMonth = futureMonth;
      }
    }
    if (maxFutureCommit > 0 && income > 0 && (maxFutureCommit / income) > 0.7) {
      result.push({
        type: 'warning',
        icon: AlertTriangle,
        text: `Atenção: em ${formatMonthLabel(worstMonth)}, suas despesas projetadas somam ${fmt(maxFutureCommit)} (${((maxFutureCommit / income) * 100).toFixed(0)}% da renda atual).`,
      });
    }

    return result;
  }, [state, currentMonth, income, transactions, cardTotal]);

  const iconColor = { danger: 'text-destructive', warning: 'text-accent', success: 'text-primary' };
  const borderColor = { danger: 'border-destructive/30', warning: 'border-accent/30', success: 'border-primary/30' };

  return (
    <div className="space-y-3">
      {tips.map((tip, i) => (
        <Card key={i} className={cn("border", borderColor[tip.type])}>
          <CardContent className="flex items-start gap-3 py-4">
            <tip.icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColor[tip.type])} />
            <p className="text-sm">{tip.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DebtSimulator() {
  const [debtAmount, setDebtAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');

  const simulation = useMemo(() => {
    const debt = parseFloat(debtAmount.replace(',', '.'));
    const payment = parseFloat(monthlyPayment.replace(',', '.'));
    const rate = parseFloat(interestRate.replace(',', '.')) / 100;

    if (isNaN(debt) || isNaN(payment) || debt <= 0 || payment <= 0) return null;

    const months: { month: number; balance: number; paid: number }[] = [];
    let balance = debt;
    let totalPaid = 0;
    let monthCount = 0;
    const maxMonths = 360;

    while (balance > 0 && monthCount < maxMonths) {
      const interest = balance * rate;
      balance += interest;
      const actualPayment = Math.min(payment, balance);
      balance -= actualPayment;
      totalPaid += actualPayment;
      monthCount++;
      months.push({ month: monthCount, balance: Math.max(0, balance), paid: totalPaid });

      if (rate > 0 && payment <= debt * rate) break; // Will never pay off
    }

    const neverPaysOff = balance > 0;

    return { months, totalPaid, monthCount, neverPaysOff, totalInterest: totalPaid - debt };
  }, [debtAmount, monthlyPayment, interestRate]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" /> Simulador de Quitação
          </CardTitle>
          <CardDescription>Descubra quanto tempo levará para quitar uma dívida</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Valor da Dívida</Label>
              <Input placeholder="Ex: 5000" value={debtAmount} onChange={e => setDebtAmount(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Pagamento Mensal</Label>
              <Input placeholder="Ex: 500" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Juros Mensal (%)</Label>
              <Input placeholder="Ex: 2 (0 se não houver)" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {simulation && (
        <Card className={cn("border", simulation.neverPaysOff ? "border-destructive" : "border-primary")}>
          <CardContent className="py-4 space-y-3">
            {simulation.neverPaysOff ? (
              <div className="text-center space-y-2">
                <Flame className="h-8 w-8 text-destructive mx-auto" />
                <p className="text-destructive font-semibold">O pagamento mensal não cobre os juros! Aumente o valor ou renegocie.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold font-mono text-primary">{simulation.monthCount}</p>
                  <p className="text-xs text-muted-foreground">meses para quitar</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-foreground">{fmt(simulation.totalPaid)}</p>
                  <p className="text-xs text-muted-foreground">total pago</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-destructive">{fmt(simulation.totalInterest)}</p>
                  <p className="text-xs text-muted-foreground">juros pagos</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DebtPriority({ currentMonth }: { currentMonth: string }) {
  const { state } = useFinance();
  const [method, setMethod] = useState<'avalanche' | 'snowball'>('avalanche');

  // Collect all installment debts
  const debts = useMemo(() => {
    const result: { id: string; description: string; remaining: number; monthlyPayment: number; remainingMonths: number; source: string }[] = [];

    // From transactions
    Object.values(state.months).forEach(md => {
      md.transactions.forEach(tx => {
        if (tx.installments) {
          const remaining = tx.installments.total - tx.installments.current + 1;
          if (remaining > 0) {
            result.push({
              id: tx.id,
              description: tx.description,
              remaining: tx.amount * remaining,
              monthlyPayment: tx.amount,
              remainingMonths: remaining,
              source: 'Despesa',
            });
          }
        }
      });
    });

    // Credit cards as debts (using invoice amount)
    state.creditCards.forEach(card => {
      if (card.invoiceAmount > 0) {
        result.push({
          id: card.id,
          description: card.name,
          remaining: card.invoiceAmount,
          monthlyPayment: card.invoiceAmount,
          remainingMonths: 1,
          source: 'Cartão',
        });
      }
    });

    // Sort based on method
    if (method === 'snowball') {
      result.sort((a, b) => a.remaining - b.remaining); // smallest first
    } else {
      result.sort((a, b) => b.monthlyPayment - a.monthlyPayment); // highest payment first (proxy for highest "interest")
    }

    return result;
  }, [state, method]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4 text-primary" /> Priorização de Dívidas
          </CardTitle>
          <CardDescription>Qual dívida pagar primeiro para se livrar mais rápido</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={method === 'snowball' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMethod('snowball')}
            >
              🏔️ Bola de Neve
            </Button>
            <Button
              variant={method === 'avalanche' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMethod('avalanche')}
            >
              🔥 Avalanche
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {method === 'snowball'
              ? 'Pague as menores primeiro para ganhar motivação e eliminar dívidas rapidamente.'
              : 'Pague as de maior parcela primeiro para economizar mais a longo prazo.'}
          </p>
        </CardContent>
      </Card>

      {debts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-primary" />
            Nenhuma dívida parcelada encontrada. Parabéns! 🎉
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {debts.map((debt, idx) => (
            <Card key={debt.id} className={cn(idx === 0 && "border-primary border-2")}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                    idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{debt.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {debt.source} · {debt.remainingMonths} meses restantes
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-sm">{fmt(debt.monthlyPayment)}/mês</p>
                  <p className="text-xs text-muted-foreground">Restante: {fmt(debt.remaining)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Solucoes;
