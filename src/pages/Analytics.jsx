import { useMemo } from 'react';
import { PieChart, Activity, AlertCircle } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

export const Analytics = () => {
  const { transactions, categories, budgets, setCategoryBudget } = useFinance();

  const analytics = useMemo(() => {
    let income = 0;
    let expense = 0;
    const expenseByCategory = {};

    categories.forEach(c => expenseByCategory[c] = 0);

    transactions.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'income') {
        income += amount;
      } else {
        expense += amount;
        if (expenseByCategory[t.category] !== undefined) {
          expenseByCategory[t.category] += amount;
        }
      }
    });

    return { income, expense, expenseByCategory };
  }, [transactions, categories]);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const profitMargin = analytics.income > 0 ? ((analytics.income - analytics.expense) / analytics.income) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
          <Activity className="text-indigo-600" /> Dashboards Analíticos
        </h2>
        <p className="text-slate-500">Panorama anual e fechamento mensal detalhado.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl">
          <p className="text-emerald-700 font-medium mb-1">Total de Entradas</p>
          <p className="text-3xl font-black text-emerald-900">{formatCurrency(analytics.income)}</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl">
          <p className="text-rose-700 font-medium mb-1">Total de Saídas</p>
          <p className="text-3xl font-black text-rose-900">{formatCurrency(analytics.expense)}</p>
        </div>
        <div className={`${profitMargin >= 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-orange-50 border-orange-200'} border p-6 rounded-3xl`}>
          <p className={`${profitMargin >= 0 ? 'text-indigo-700' : 'text-orange-700'} font-medium mb-1`}>Margem de Economia</p>
          <p className={`text-3xl font-black ${profitMargin >= 0 ? 'text-indigo-900' : 'text-orange-900'}`}>
            {profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <PieChart size={24} className="text-indigo-600" /> Despesas por Categoria e Orçamento
        </h3>

        <div className="space-y-6">
          {categories.map(category => {
            const spent = analytics.expenseByCategory[category];
            const budget = budgets[category] || 0;
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;

            // Only show categories that have expenses or a defined budget
            if (spent === 0 && budget === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-bold text-slate-800">{category}</p>
                    <p className="text-sm text-slate-500">Gasto: {formatCurrency(spent)}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">Orçamento:</span>
                      <input
                        type="number"
                        value={budget || ''}
                        onChange={(e) => setCategoryBudget(category, parseFloat(e.target.value) || 0)}
                        placeholder="R$ 0,00"
                        className="w-24 text-right text-sm border-b border-slate-300 focus:border-indigo-500 outline-none bg-transparent"
                      />
                    </div>
                    {budget > 0 && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        percentage > 100 ? 'bg-rose-100 text-rose-700' :
                        percentage > 80 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {percentage.toFixed(1)}% do limite
                      </span>
                    )}
                  </div>
                </div>

                {budget > 0 && (
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage > 100 ? 'bg-rose-500' :
                        percentage > 80 ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                )}
                {budget === 0 && spent > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                    <AlertCircle size={12} /> Defina um orçamento para medir o progresso.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
