import { CreditCard, Lightbulb, BarChart3, LayoutDashboard, List, Wallet } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Despesas', url: '/despesas', icon: List },
  { title: 'Cartão de Crédito', url: '/cartao', icon: CreditCard },
  { title: 'Visualização', url: '/visualizacao', icon: BarChart3 },
  { title: 'Soluções', url: '/solucoes', icon: Lightbulb },
];

export function AppSidebar() {
  return (
    <aside className="w-64 border-r border-white/10 bg-[#0f1220]/90 backdrop-blur-xl p-5 flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-md bg-emerald-400/20 text-emerald-300 grid place-items-center">
          <Wallet className="h-4 w-4" />
        </div>
        <span className="text-2xl font-semibold tracking-tight">FinControl</span>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">Menu</p>
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 transition',
                  'hover:bg-white/10 hover:text-white',
                  isActive && 'bg-white/10 text-white'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="text-sm">{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
