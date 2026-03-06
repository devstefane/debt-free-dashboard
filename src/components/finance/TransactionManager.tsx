import { useState } from 'react';
import { Plus, Trash2, Check, Circle, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinance, getMonthBills, getMonthIncome } from '@/contexts/FinanceContext';
import type { BillType, Bill } from '@/types/finance';
import { cn } from '@/lib/utils';

interface TransactionManagerProps {
  currentMonth: string;
}

const typeLabels: Record<BillType, string> = {
  fixed: 'Conta Fixa',
  variable: 'Conta Variável',
  installment: 'Parcelado',
};

const typeColors: Record<BillType, string> = {
  fixed: 'bg-chart-fixed',
  variable: 'bg-chart-lifestyle',
  installment: 'bg-chart-installment',
};

export function TransactionManager({ currentMonth }: TransactionManagerProps) {
  const { state, setIncome, addBill, removeBill, togglePaid, setVariableAmount } = useFinance();
  const income = getMonthIncome(state, currentMonth);
  const monthBills = getMonthBills(state, currentMonth);

  const [incomeInput, setIncomeInput] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [billType, setBillType] = useState<BillType>('fixed');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [editingVariable, setEditingVariable] = useState<string | null>(null);
  const [variableInput, setVariableInput] = useState('');

  const handleSetIncome = () => {
    const val = parseFloat(incomeInput.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      setIncome(currentMonth, val);
      setIncomeInput('');
    }
  };

  const handleAddBill = () => {
    const val = parseFloat(amount.replace(',', '.'));
    if (!desc || (billType !== 'variable' && (isNaN(val) || val <= 0))) return;
    if (billType === 'variable' && !desc) return;

    const bill: Bill = {
      id: crypto.randomUUID(),
      description: desc,
      type: billType,
      startMonth: currentMonth,
      active: true,
    };

    if (billType === 'fixed') {
      bill.amount = val;
    } else if (billType === 'installment') {
      const total = parseInt(totalInstallments) || 1;
      bill.amount = val;
      bill.installmentTotal = total;
    }
    // variable: no amount set at creation

    addBill(bill);
    setDesc('');
    setAmount('');
    setTotalInstallments('');
  };

  const handleSaveVariableAmount = (billId: string) => {
    const val = parseFloat(variableInput.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      setVariableAmount(currentMonth, billId, val);
    }
    setEditingVariable(null);
    setVariableInput('');
  };

  const totalAll = monthBills.reduce((s, b) => s + b.amount, 0);
  const totalPaid = monthBills.filter(b => b.paid).reduce((s, b) => s + b.amount, 0);
  const totalPending = totalAll - totalPaid;

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
            <Button onClick={handleSetIncome} size="sm">Salvar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Bill */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cadastrar Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select value={billType} onValueChange={v => setBillType(v as BillType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Conta Fixa (replicada todo mês)</SelectItem>
                <SelectItem value="variable">Conta Variável (valor muda por mês)</SelectItem>
                <SelectItem value="installment">Parcelado (parcelas automáticas)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Descrição</Label>
              <Input placeholder="Ex: Aluguel" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            {billType !== 'variable' && (
              <div>
                <Label className="text-xs text-muted-foreground">
                  {billType === 'installment' ? 'Valor da Parcela' : 'Valor'}
                </Label>
                <Input placeholder="Ex: 1200" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
            )}
          </div>

          {billType === 'installment' && (
            <div>
              <Label className="text-xs text-muted-foreground">Total de Parcelas</Label>
              <Input placeholder="Ex: 10" value={totalInstallments} onChange={e => setTotalInstallments(e.target.value)} />
            </div>
          )}

          <Button onClick={handleAddBill} className="w-full gap-2">
            <Plus className="h-4 w-4" /> Cadastrar
          </Button>
        </CardContent>
      </Card>

      {/* Month Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumo do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold font-mono">R$ {totalAll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <p className="text-xs text-muted-foreground">Pago</p>
              <p className="text-lg font-bold font-mono text-primary">R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-destructive/10">
              <p className="text-xs text-muted-foreground">Pendente</p>
              <p className="text-lg font-bold font-mono text-destructive">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contas do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {monthBills.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma conta para este mês</p>
          ) : (
            <div className="space-y-2">
              {monthBills.map(({ bill, paid, amount: billAmount, installmentLabel }) => (
                <div
                  key={bill.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    paid && "bg-primary/5 border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePaid(currentMonth, bill.id)}
                      className="flex-shrink-0"
                    >
                      {paid ? (
                        <Check className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className={cn("w-2 h-2 rounded-full", typeColors[bill.type])} />
                    <div>
                      <p className={cn("text-sm font-medium", paid && "line-through opacity-70")}>
                        {bill.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {typeLabels[bill.type]}
                        {installmentLabel && ` · Parcela ${installmentLabel}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {bill.type === 'variable' && editingVariable === bill.id ? (
                      <div className="flex gap-1">
                        <Input
                          className="w-24 h-7 text-sm"
                          value={variableInput}
                          onChange={e => setVariableInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSaveVariableAmount(bill.id)}
                          autoFocus
                        />
                        <Button size="icon" className="h-7 w-7" onClick={() => handleSaveVariableAmount(bill.id)}>
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className={cn("text-sm font-mono font-medium", paid && "line-through opacity-70")}>
                          {billAmount > 0
                            ? `R$ ${billAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : bill.type === 'variable' ? 'Informar valor' : 'R$ 0,00'}
                        </span>
                        {bill.type === 'variable' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditingVariable(bill.id);
                              setVariableInput(billAmount > 0 ? String(billAmount) : '');
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeBill(bill.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
