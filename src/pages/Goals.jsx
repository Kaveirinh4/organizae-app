import { useState } from 'react';
import { Target, PlusCircle, Trash2, Edit2 } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

export const Goals = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;

    addGoal({
      id: Date.now().toString(),
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline,
    });

    setIsAdding(false);
    setFormData({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
  };

  const handleAddContribution = (id, amount) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      updateGoal(id, { ...goal, currentAmount: goal.currentAmount + parseFloat(amount) });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Target className="text-indigo-600" /> Metas Financeiras
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle size={20} /> Nova Meta
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Meta</label>
            <input
              type="text" required value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl" placeholder="Ex: Viagem Europa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Alvo (R$)</label>
            <input
              type="number" required value={formData.targetAmount}
              onChange={e => setFormData({...formData, targetAmount: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl" placeholder="10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Atual Salvo (R$)</label>
            <input
              type="number" value={formData.currentAmount}
              onChange={e => setFormData({...formData, currentAmount: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl" placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prazo (Opcional)</label>
            <input
              type="date" value={formData.deadline}
              onChange={e => setFormData({...formData, deadline: e.target.value})}
              className="w-full px-4 py-2 border rounded-xl"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Salvar Meta</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          return (
            <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{goal.name}</h3>
                  {goal.deadline && <p className="text-sm text-slate-500">Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>}
                </div>
                <button onClick={() => deleteGoal(goal.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg">
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="mb-2 flex justify-between text-sm font-medium">
                <span className="text-indigo-600">{formatCurrency(goal.currentAmount)}</span>
                <span className="text-slate-500">de {formatCurrency(goal.targetAmount)}</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                <div className="bg-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="flex gap-2">
                <input type="number" id={`add-${goal.id}`} placeholder="Aporte (R$)" className="w-1/2 px-3 py-2 border rounded-lg text-sm" />
                <button
                  onClick={() => {
                    const input = document.getElementById(`add-${goal.id}`);
                    if(input.value) {
                      handleAddContribution(goal.id, input.value);
                      input.value = '';
                    }
                  }}
                  className="w-1/2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
                >
                  Adicionar Aporte
                </button>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && !isAdding && (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            Você ainda não possui nenhuma meta financeira. Clique em "Nova Meta" para começar!
          </div>
        )}
      </div>
    </div>
  );
};
