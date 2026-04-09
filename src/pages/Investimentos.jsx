import { useState, useMemo } from 'react';
import { Briefcase, TrendingUp, ShieldCheck, PieChart, PlusCircle, Trash2 } from 'lucide-react';
import { useFinance } from '../FinanceContext';

export const Investimentos = () => {
  const { investments, addInvestment, deleteInvestment } = useFinance();

  // Controla se o formulário de adicionar novo investimento está aberto
  const [isAdding, setIsAdding] = useState(false);

  // Estado local para o formulário
  const [formData, setFormData] = useState({
    name: '',
    type: 'Reserva de Emergência',
    amount: '',
  });

  // Categorias permitidas
  const investmentTypes = ['Reserva de Emergência', 'Renda Fixa', 'Renda Variável'];

  // Função para salvar no contexto
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    addInvestment({
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      amount: parseFloat(formData.amount),
    });

    // Fecha o formulário e zera os campos
    setIsAdding(false);
    setFormData({ name: '', type: 'Reserva de Emergência', amount: '' });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Faz a matemática para somar todo o patrimônio e dividir pelas categorias
  const summary = useMemo(() => {
    const res = { 'Reserva de Emergência': 0, 'Renda Fixa': 0, 'Renda Variável': 0, total: 0 };
    investments.forEach(inv => {
      res[inv.type] += inv.amount;
      res.total += inv.amount;
    });
    return res;
  }, [investments]);

  return (
    <div className="space-y-6">

      {/* CABEÇALHO */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Briefcase className="text-emerald-600" /> Carteira de Investimentos
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <PlusCircle size={20} /> Novo Ativo
        </button>
      </div>

      {/* QUADROS DE RESUMO DE PATRIMÔNIO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm font-medium text-slate-400 mb-1">Patrimônio Total</p>
          <p className="text-3xl font-bold">{formatCurrency(summary.total)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-600 font-medium mb-2"><ShieldCheck size={18}/> Reserva</div>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(summary['Reserva de Emergência'])}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-medium mb-2"><TrendingUp size={18}/> Renda Fixa</div>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(summary['Renda Fixa'])}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-rose-600 font-medium mb-2"><PieChart size={18}/> Renda Variável</div>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(summary['Renda Variável'])}</p>
        </div>
      </div>

      {/* FORMULÁRIO (Aparece ao clicar em "Novo Ativo") */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Ativo</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-emerald-500" placeholder="Ex: Tesouro Selic, PETR4" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-emerald-500">
              {investmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Atual (R$)</label>
            <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-emerald-500" placeholder="1500.00" />
          </div>
          <div className="md:col-span-3 flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Salvar Ativo</button>
          </div>
        </form>
      )}

      {/* TABELA DE LISTAGEM DOS ATIVOS */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-600">Ativo</th>
              <th className="p-4 font-semibold text-slate-600">Categoria</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Valor Atual</th>
              <th className="p-4 font-semibold text-slate-600 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {investments.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-800">{inv.name}</td>
                <td className="p-4">
                  {/* Etiqueta colorida da Categoria */}
                  <span className={`px-2 py-1 text-xs rounded-md font-medium ${
                    inv.type === 'Reserva de Emergência' ? 'bg-emerald-50 text-emerald-700' :
                    inv.type === 'Renda Fixa' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {inv.type}
                  </span>
                </td>
                <td className="p-4 font-semibold text-right">{formatCurrency(inv.amount)}</td>
                <td className="p-4 text-center">
                  <button onClick={() => deleteInvestment(inv.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 size={18} className="mx-auto" />
                  </button>
                </td>
              </tr>
            ))}
            {/* Mensagem caso a tabela esteja vazia */}
            {investments.length === 0 && (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500">Nenhum ativo cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
