import { useState } from 'react';
import { CreditCard as CreditCardIcon, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MonthNavigator } from '@/components/finance/MonthNavigator';
import { useFinance } from '@/contexts/FinanceContext';
import { getMonthKey, formatMonthLabel } from '@/types/finance';

const CartaoCredito = () => {
  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey(new Date()));
  const { state, addCreditCard, removeCreditCard } = useFinance();

  const [cardName, setCardName] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [dueDay, setDueDay] = useState('');

  const handleAddCard = () => {
    const amount = parseFloat(invoiceAmount.replace(',', '.'));
    const due = parseInt(dueDay);
    if (!cardName || isNaN(amount) || isNaN(due)) return;
    addCreditCard({
      id: crypto.randomUUID(),
      name: cardName,
      invoiceAmount: amount,
      dueDay: due,
    });
    setCardName('');
    setInvoiceAmount('');
    setDueDay('');
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Nome do Cartão</Label>
              <Input placeholder="Ex: Nubank" value={cardName} onChange={e => setCardName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Valor da Fatura</Label>
              <Input placeholder="Ex: 1500,00" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Dia de Vencimento</Label>
              <Input placeholder="Ex: 15" value={dueDay} onChange={e => setDueDay(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleAddCard} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar Cartão
          </Button>
        </CardContent>
      </Card>

      {/* Cards List */}
      {state.creditCards.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum cartão cadastrado
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {state.creditCards.map(card => (
            <Card key={card.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <CreditCardIcon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{card.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Fatura: <span className="font-mono font-medium text-foreground">R$ {fmt(card.invoiceAmount)}</span>
                      {' · '}Vence dia {card.dueDay}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCreditCard(card.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartaoCredito;
