import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { AppSidebar } from '@/components/AppSidebar';
import Index from './pages/Index';
import Despesas from './pages/Despesas';
import CartaoCredito from './pages/CartaoCredito';
import Visualizacao from './pages/Visualizacao';
import Solucoes from './pages/Solucoes';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FinanceProvider>
          <div className="min-h-screen bg-[#090d19] text-slate-100 dark">
            <div className="min-h-screen flex bg-[radial-gradient(circle_at_top,#252b42_0%,#11162a_45%,#090d19_100%)]">
              <AppSidebar />
              <main className="flex-1 p-6 lg:p-8 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/despesas" element={<Despesas />} />
                  <Route path="/cartao" element={<CartaoCredito />} />
                  <Route path="/visualizacao" element={<Visualizacao />} />
                  <Route path="/solucoes" element={<Solucoes />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </FinanceProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
