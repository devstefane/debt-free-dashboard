import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinance, getMonthTransactions, getMonthIncome } from '@/contexts/FinanceContext';
import type { ExpenseCategory, Transaction } from '@/types/finance';
import { cn } from '@/lib/utils';

interface TransactionManagerProps {
  currentMonth: string;
}

const categoryLabels: Record<ExpenseCategory, string> = {
  fixed: 'Conta Fixa',
  lifestyle: 'Não Essencial',
  installment: 'Parcelado',
};

const categoryColors: Record<ExpenseCategory, string> = {
  fixed: 'bg-chart-fixed',
  lifestyle: 'bg-chart-lifestyle',
  installment: 'bg-chart-installment',
};

export function TransactionManager({ currentMonth }: TransactionManagerProps) {
  const { state, setIncome, addTransaction, removeTransaction } = useFinance();
  const income = getMonthIncome(state, currentMonth);
  const transactions = getMonthTransactions(state, currentMonth);

  const [incomeInput, setIncomeInput] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('fixed');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [currentInstallment, setCurrentInstallment] = useState('');

  const handleSetIncome = () => {
    const val = parseFloat(incomeInput.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      setIncome(currentMonth, val);
      setIncomeInput('');
    }
  };

  const handleAddTransaction = () => {
    const val = parseFloat(amount.replace(',', '.'));
    if (!desc || isNaN(val) || val <= 0) return;

    const tx: Transaction = {
      id: crypto.randomUUID(),
      description: desc,
      amount: category === 'installment' ? val / (parseInt(totalInstallments) || 1) : val,
      category,
      startMonth: currentMonth,
    };

    if (category === 'installment') {
      const total = parseInt(totalInstallments) || 1;
      const current = parseInt(currentInstallment) || 1;
      tx.installments = { total, current, totalAmount: val };
      tx.amount = val / total;
    }

    addTransaction(currentMonth, tx);
    setDesc('');
    setAmount('');
    setTotalInstallments('');
    setCurrentInstallment('');
  };

  // Separate own transactions from projected
  const ownTransactions = state.months[currentMonth]?.transactions || [];
  const projectedOnly = transactions.filter(t => t.id.includes('-proj-'));

  return (
    <div className="space-y-4">
      {/* Income */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Definir Renda Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder={income > 0 ? `Atual: R$ ${income.toLocaleString('pt-BR')}` : 'Ex: 5000'}
              value={incomeInput}
              onChange={e => setIncomeInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSetIncome()}
            />
            <Button onClick={handleSetIncome} size="sm">
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Transaction */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Adicionar Despesa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Descrição</Label>
              <Input placeholder="Ex: Aluguel" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                {category === 'installment' ? 'Valor Total' : 'Valor'}
              </Label>
              <Input placeholder="Ex: 1200" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Categoria</Label>
            <Select value={category} onValueChange={v => setCategory(v as ExpenseCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Conta Fixa (sobrevivência)</SelectItem>
                <SelectItem value="lifestyle">Não Essencial (estilo de vida)</SelectItem>
                <SelectItem value="installment">Parcelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {category === 'installment' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Total de Parcelas</Label>
                <Input placeholder="Ex: 10" value={totalInstallments} onChange={e => setTotalInstallments(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Parcela Atual</Label>
                <Input placeholder="Ex: 1" value={currentInstallment} onChange={e => setCurrentInstallment(e.target.value)} />
              </div>
            </div>
          )}

          <Button onClick={handleAddTransaction} className="w-full gap-2">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Despesas do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma despesa cadastrada</p>
          ) : (
            <div className="space-y-2">
              {transactions.map(tx => {
                const isProjected = tx.id.includes('-proj-');
                return (
                  <div
                    key={tx.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      isProjected && "opacity-70 border-dashed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", categoryColors[tx.category])} />
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryLabels[tx.category]}
                          {tx.installments && ` · ${tx.installments.current}/${tx.installments.total}`}
                          {isProjected && ' · Projetado'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-medium">
                        R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      {!isProjected && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeTransaction(currentMonth, tx.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
