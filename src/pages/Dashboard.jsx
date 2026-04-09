import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Users } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

export const Dashboard = () => {
  const { transactions } = useFinance();

  const summary = useMemo(() => {
    let income = 0;
    let expenseTotal = 0;
    let expenseComum = 0;
    let expenseRobert = 0;
    let expenseEsposa = 0;

    transactions.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'income') {
        income += amount;
      } else {
        expenseTotal += amount;
        if (t.owner === 'Casal (Comum)') expenseComum += amount;
        if (t.owner === 'Robert') expenseRobert += amount;
        if (t.owner === 'Esposa') expenseEsposa += amount;
      }
    });

    const robertDevePagar = expenseRobert + (expenseComum / 2);
    const esposaDevePagar = expenseEsposa + (expenseComum / 2);
    const balance = income - expenseTotal;

    return {
      income,
      expenseTotal,
      balance,
      expenseComum,
      robertDevePagar,
      esposaDevePagar
    };
  }, [transactions]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Resumo Geral</h2>

      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Saldo Atual</p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Receitas</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(summary.income)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Despesas</p>
              <p className="text-2xl font-bold text-rose-600">
                {formatCurrency(summary.expenseTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Casal Module */}
      <div className="mt-8 bg-indigo-50/50 border border-indigo-100 p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-indigo-900">Fechamento do Mês (Divisão)</h3>
            <p className="text-indigo-700/70 text-sm">Despesas comuns (Mercado, Casa, etc): <span className="font-semibold">{formatCurrency(summary.expenseComum)}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50/50">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-slate-500">Fatura Robert</p>
              <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">
                Individual + 50% Comum
              </span>
            </div>
            <p className="text-3xl font-black text-slate-800">
              {formatCurrency(summary.robertDevePagar)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50/50">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-slate-500">Fatura Esposa</p>
              <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">
                Individual + 50% Comum
              </span>
            </div>
            <p className="text-3xl font-black text-slate-800">
              {formatCurrency(summary.esposaDevePagar)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
