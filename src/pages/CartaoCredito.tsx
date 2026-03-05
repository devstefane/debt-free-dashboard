import { useState } from 'react';
import { CreditCard as CreditCardIcon, Plus, Trash2, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { MonthNavigator } from '@/components/finance/MonthNavigator';
import { useFinance, getCardExpensesForMonth } from '@/contexts/FinanceContext';
import type { CreditCard, CreditCardExpense } from '@/types/finance';
import { getMonthKey, formatMonthLabel } from '@/types/finance';
import { cn } from '@/lib/utils';

const CartaoCredito = () => {
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date()));
  const { state, addCreditCard, removeCreditCard, addCardExpense, removeCardExpense } = useFinance();

  const [cardName, setCardName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expInstTotal, setExpInstTotal] = useState('');
  const [expInstCurrent, setExpInstCurrent] = useState('');

  const handleAddCard = () => {
    const limit = parseFloat(cardLimit.replace(',', '.'));
    const closing = parseInt(closingDay);
    const due = parseInt(dueDay);
    if (!cardName || isNaN(limit) || isNaN(closing) || isNaN(due)) return;
    addCreditCard({
      id: crypto.randomUUID(),
      name: cardName,
      limit,
      closingDay: closing,
      dueDay: due,
    });
    setCardName('');
    setCardLimit('');
    setClosingDay('');
    setDueDay('');
  };

  const handleAddExpense = () => {
    if (!selectedCard || !expDesc) return;
    const amount = parseFloat(expAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    const totalInst = parseInt(expInstTotal);
    const currentInst = parseInt(expInstCurrent);
    const isInstallment = !isNaN(totalInst) && totalInst > 1;

    const expense: CreditCardExpense = {
      id: crypto.randomUUID(),
      cardId: selectedCard,
      description: expDesc,
      amount: isInstallment ? amount / totalInst : amount,
      startMonth: currentMonth,
      ...(isInstallment && {
        installments: {
          total: totalInst,
          current: isNaN(currentInst) ? 1 : currentInst,
          totalAmount: amount,
        },
      }),
    };
    addCardExpense(expense);
    setExpDesc('');
    setExpAmount('');
    setExpInstTotal('');
    setExpInstCurrent('');
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Cartão de Crédito</h1>
        <MonthNavigator currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>

      {/* Add Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4 text-primary" /> Cadastrar Cartão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <Input placeholder="Ex: Nubank" value={cardName} onChange={e => setCardName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Limite</Label>
              <Input placeholder="Ex: 5000" value={cardLimit} onChange={e => setCardLimit(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Dia Fechamento</Label>
              <Input placeholder="Ex: 5" value={closingDay} onChange={e => setClosingDay(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Dia Vencimento</Label>
              <Input placeholder="Ex: 15" value={dueDay} onChange={e => setDueDay(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleAddCard} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar Cartão
          </Button>
        </CardContent>
      </Card>

      {/* Cards List with Invoices */}
      {state.creditCards.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum cartão cadastrado
          </CardContent>
        </Card>
      ) : (
        state.creditCards.map(card => {
          const expenses = getCardExpensesForMonth(state, currentMonth, card.id);
          const totalUsed = expenses.reduce((s, e) => s + e.amount, 0);
          const usagePercent = card.limit > 0 ? (totalUsed / card.limit) * 100 : 0;
          const isSelected = selectedCard === card.id;

          return (
            <Card key={card.id} className={cn("transition-colors", isSelected && "border-primary")}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCardIcon className="h-4 w-4" />
                    {card.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedCard(isSelected ? null : card.id)}>
                      <Receipt className="h-3 w-3 mr-1" /> {isSelected ? 'Fechar' : 'Lançar'}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeCreditCard(card.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Usage bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Fatura {formatMonthLabel(currentMonth)}: <span className="font-mono font-medium text-foreground">R$ {fmt(totalUsed)}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Limite: <span className="font-mono font-medium text-foreground">R$ {fmt(card.limit)}</span>
                    </span>
                  </div>
                  <Progress
                    value={Math.min(usagePercent, 100)}
                    className={cn("h-2", usagePercent > 80 ? "[&>div]:bg-destructive" : "[&>div]:bg-primary")}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Fecha dia {card.closingDay} · Vence dia {card.dueDay}</span>
                    <span className={cn(usagePercent > 80 ? "text-destructive" : "text-primary")}>
                      {usagePercent.toFixed(1)}% usado
                    </span>
                  </div>
                </div>

                {/* Add expense form */}
                {isSelected && (
                  <div className="border border-dashed border-border rounded-lg p-3 space-y-3">
                    <p className="text-sm font-medium">Nova despesa no cartão</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Descrição</Label>
                        <Input placeholder="Ex: iFood" value={expDesc} onChange={e => setExpDesc(e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Valor Total</Label>
                        <Input placeholder="Ex: 300" value={expAmount} onChange={e => setExpAmount(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Parcelas (vazio = à vista)</Label>
                        <Input placeholder="Ex: 6" value={expInstTotal} onChange={e => setExpInstTotal(e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Parcela Atual</Label>
                        <Input placeholder="Ex: 1" value={expInstCurrent} onChange={e => setExpInstCurrent(e.target.value)} />
                      </div>
                    </div>
                    <Button onClick={handleAddExpense} size="sm" className="w-full gap-2">
                      <Plus className="h-4 w-4" /> Adicionar Despesa
                    </Button>
                  </div>
                )}

                {/* Expenses list */}
                {expenses.length > 0 && (
                  <div className="space-y-1">
                    {expenses.map(exp => {
                      const isProjected = exp.id.includes('-proj-');
                      return (
                        <div key={exp.id} className={cn(
                          "flex items-center justify-between p-2 rounded-md border text-sm",
                          isProjected && "opacity-70 border-dashed"
                        )}>
                          <div>
                            <span className="font-medium">{exp.description}</span>
                            {exp.installments && (
                              <span className="text-xs text-muted-foreground ml-2">
                                {exp.installments.current}/{exp.installments.total}x
                              </span>
                            )}
                            {isProjected && <span className="text-xs text-muted-foreground ml-1">· Projetado</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">R$ {fmt(exp.amount)}</span>
                            {!isProjected && (
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCardExpense(exp.id)}>
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
          );
        })
      )}
    </div>
  );
};

export default CartaoCredito;
