import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance, getMonthBills, getMonthIncome } from '@/contexts/FinanceContext';

interface FinanceChartsProps {
  currentMonth: string;
}

const PIE_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
];

const typeLabels: Record<string, string> = {
  fixed: 'Fixos',
  variable: 'Variáveis',
  installment: 'Parcelados',
};

export function FinanceCharts({ currentMonth }: FinanceChartsProps) {
  const { state } = useFinance();
  const income = getMonthIncome(state, currentMonth);
  const bills = getMonthBills(state, currentMonth);

  const byType = ['fixed', 'variable', 'installment'].map(type => {
    const total = bills.filter(b => b.bill.type === type).reduce((s, b) => s + b.amount, 0);
    return { name: typeLabels[type], value: Math.round(total * 100) / 100 };
  }).filter(d => d.value > 0);

  const totalExpenses = byType.reduce((s, d) => s + d.value, 0);

  const barData = [
    { name: 'Renda', value: income, fill: 'hsl(142, 71%, 45%)' },
    { name: 'Despesas', value: totalExpenses, fill: 'hsl(0, 72%, 51%)' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Composição de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          {byType.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Sem dados</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byType} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {byType.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[['Fixos', 'Variáveis', 'Parcelados'].indexOf(entry.name)] || PIE_COLORS[0]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: 'hsl(222, 47%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(210, 40%, 92%)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Renda vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <Tooltip
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                contentStyle={{ backgroundColor: 'hsl(222, 47%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px' }}
                labelStyle={{ color: 'hsl(210, 40%, 92%)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
