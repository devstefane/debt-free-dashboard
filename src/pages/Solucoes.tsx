import { useState } from 'react';
import { Lightbulb, Calculator, ArrowDownUp, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance, getMonthBills, getMonthIncome, type MonthBillView } from '@/contexts/FinanceContext';
import { getMonthKey } from '@/types/finance';
import type { FinanceState } from '@/types/finance';
import { cn } from '@/lib/utils';

const Solucoes = () => {
  const { state } = useFinance();
  const currentMonth = getMonthKey(new Date());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Soluções Inteligentes</h1>
      <Tabs defaultValue="dicas">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dicas" className="gap-2"><Lightbulb className="h-4 w-4" />Dicas</TabsTrigger>
          <TabsTrigger value="simulador" className="gap-2"><Calculator className="h-4 w-4" />Simulador</TabsTrigger>
          <TabsTrigger value="priorizacao" className="gap-2"><ArrowDownUp className="h-4 w-4" />Priorização</TabsTrigger>
        </TabsList>

        <TabsContent value="dicas"><DicasTab state={state} currentMonth={currentMonth} /></TabsContent>
        <TabsContent value="simulador"><SimuladorTab /></TabsContent>
        <TabsContent value="priorizacao"><PriorizacaoTab state={state} currentMonth={currentMonth} /></TabsContent>
      </Tabs>
    </div>
  );
};

function DicasTab({ state, currentMonth }: { state: FinanceState; currentMonth: string }) {
  const income = getMonthIncome(state, currentMonth);
  const bills = getMonthBills(state, currentMonth);
  const totalExpenses = bills.reduce((s, b) => s + b.amount, 0);
  const fixedTotal = bills.filter(b => b.bill.type === 'fixed').reduce((s, b) => s + b.amount, 0);
  const pendingCount = bills.filter(b => !b.paid).length;

  const tips: { icon: typeof AlertTriangle; title: string; desc: string; type: string }[] = [];

  if (income > 0 && totalExpenses / income > 0.8) {
    tips.push({ icon: AlertTriangle, title: 'Gastos elevados', desc: `Suas despesas representam ${((totalExpenses / income) * 100).toFixed(0)}% da renda. Revise contas variáveis.`, type: 'danger' });
  }
  if (pendingCount > 0) {
    tips.push({ icon: AlertTriangle, title: 'Contas pendentes', desc: `Você tem ${pendingCount} conta(s) não paga(s) este mês.`, type: 'warning' });
  }
  if (income > 0 && fixedTotal / income > 0.5) {
    tips.push({ icon: TrendingUp, title: 'Fixos acima de 50%', desc: 'Considere renegociar contratos fixos para liberar margem.', type: 'warning' });
  }
  if (tips.length === 0) {
    tips.push({ icon: Lightbulb, title: 'Tudo certo!', desc: 'Suas finanças estão em bom estado neste mês.', type: 'healthy' });
  }

  return (
    <div className="space-y-3 mt-4">
      {tips.map((tip, i) => (
        <Card key={i} className={cn("border-l-4", tip.type === 'danger' ? 'border-l-destructive' : tip.type === 'warning' ? 'border-l-accent' : 'border-l-primary')}>
          <CardContent className="flex items-start gap-3 p-4">
            <tip.icon className={cn("h-5 w-5 mt-0.5", tip.type === 'danger' ? 'text-destructive' : tip.type === 'warning' ? 'text-accent' : 'text-primary')} />
            <div>
              <p className="font-medium">{tip.title}</p>
              <p className="text-sm text-muted-foreground">{tip.desc}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SimuladorTab() {
  const [debt, setDebt] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('');
  const [result, setResult] = useState<{ months: number; totalPaid: number } | null>(null);

  const simulate = () => {
    const d = parseFloat(debt.replace(',', '.'));
    const m = parseFloat(monthly.replace(',', '.'));
    const r = parseFloat(rate.replace(',', '.')) / 100;
    if (isNaN(d) || isNaN(m) || m <= 0) return;

    let remaining = d;
    let months = 0;
    let totalPaid = 0;
    while (remaining > 0 && months < 600) {
      remaining *= (1 + r);
      const payment = Math.min(m, remaining);
      remaining -= payment;
      totalPaid += payment;
      months++;
    }
    setResult({ months, totalPaid: Math.round(totalPaid * 100) / 100 });
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Simulador de Quitação</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs text-muted-foreground">Dívida Total</Label><Input placeholder="10000" value={debt} onChange={e => setDebt(e.target.value)} /></div>
            <div><Label className="text-xs text-muted-foreground">Aporte Mensal</Label><Input placeholder="500" value={monthly} onChange={e => setMonthly(e.target.value)} /></div>
            <div><Label className="text-xs text-muted-foreground">Juros (%/mês)</Label><Input placeholder="1.5" value={rate} onChange={e => setRate(e.target.value)} /></div>
          </div>
          <Button onClick={simulate} className="w-full">Simular</Button>
          {result && (
            <div className="p-4 rounded-lg bg-muted/50 space-y-1">
              <p className="text-sm">Tempo: <strong>{result.months} meses</strong> ({(result.months / 12).toFixed(1)} anos)</p>
              <p className="text-sm">Total pago: <strong>R$ {result.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PriorizacaoTab({ state, currentMonth }: { state: FinanceState; currentMonth: string }) {
  const bills = getMonthBills(state, currentMonth);
  const unpaid = bills.filter(b => !b.paid && b.amount > 0);

  const snowball = [...unpaid].sort((a, b) => a.amount - b.amount);
  const avalanche = [...unpaid].sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">❄️ Bola de Neve</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Pague as menores primeiro para ganhar motivação</p>
            {snowball.length === 0 ? <p className="text-sm text-muted-foreground">Sem contas pendentes</p> : (
              <div className="space-y-2">
                {snowball.map((b, i) => (
                  <div key={b.bill.id} className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">{i + 1}. {b.bill.description}</span>
                    <span className="text-sm font-mono">R$ {b.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">🔥 Avalanche</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Pague as maiores primeiro para economizar no total</p>
            {avalanche.length === 0 ? <p className="text-sm text-muted-foreground">Sem contas pendentes</p> : (
              <div className="space-y-2">
                {avalanche.map((b, i) => (
                  <div key={b.bill.id} className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">{i + 1}. {b.bill.description}</span>
                    <span className="text-sm font-mono">R$ {b.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Solucoes;
