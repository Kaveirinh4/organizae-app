import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useFinance } from '../FinanceContext';

export const NovoLancamento = () => {
  // O "useNavigate" permite que mudemos o usuário de página usando o código (ex: redirecionar após salvar)
  const navigate = useNavigate();

  // Puxamos as listas de dados do nosso contexto global
  const { categories, incomeCategories, owners, paymentMethods, addTransaction } = useFinance();

  // "formData" é uma variável de estado que guarda tudo o que o usuário digita nos campos de texto.
  const [formData, setFormData] = useState({
    type: 'expense',
    date: new Date().toISOString().split('T')[0], // Pega a data de hoje por padrão
    description: '',
    amount: '',
    category: categories[0] || '',
    owner: owners[0] || '',
    method: paymentMethods[0] || '',
    status: 'efetivado',
    isRecurring: false,
  });

  // Função disparada quando o usuário clica no botão "Salvar" do formulário
  const handleSubmit = (e) => {
    e.preventDefault(); // Impede a página de recarregar

    // Verificação de Segurança
    if (!formData.description || !formData.amount || !formData.category || !formData.owner || !formData.method) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    // Cria o objeto da transação e gera um ID falso usando a hora atual (Date.now())
    const newTransaction = {
      ...formData,
      id: Date.now().toString(),
      amount: parseFloat(formData.amount),
    };

    // Chama a função global para salvar no banco
    addTransaction(newTransaction);

    // Redireciona o usuário para a tela de extrato
    navigate('/extrato');
  };

  // Quando o usuário muda de "Receita" para "Despesa" ou vice-versa, os campos devem mudar
  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      category: type === 'expense' ? (categories[0] || '') : (incomeCategories[0] || '')
    }));
  };

  // Escolhe qual lista de categorias vai aparecer no select (Receita ou Despesa)
  const activeCategories = formData.type === 'expense' ? categories : incomeCategories;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Novo Lançamento</h2>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

          {/* SELEÇÃO DO TIPO (Botões Gigantes) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Tipo</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  formData.type === 'expense'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold'
                    : 'border-slate-100 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50/50'
                }`}
              >
                <ArrowDownRight size={20} />
                Despesa
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  formData.type === 'income'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                    : 'border-slate-100 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/50'
                }`}
              >
                <ArrowUpRight size={20} />
                Receita
              </button>
            </div>
          </div>

          {/* DADOS BÁSICOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input
                type="date" required value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
              <input
                type="number" step="0.01" min="0.01" required placeholder="0.00" value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <input
              type="text" required placeholder={formData.type === 'expense' ? "Ex: Mercado, Jantar" : "Ex: Salário, Rendimento"}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* DETALHES (STATUS, RECORRÊNCIA, CATEGORIA E DONO) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">

            {/* Status do Lançamento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                required value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="efetivado">Efetivado (Pago/Recebido)</option>
                <option value="pendente">Pendente / Agendado</option>
              </select>
            </div>

            {/* Checkbox "É Recorrente?" (Só aparece se for despesa) */}
            {formData.type === 'expense' && (
              <div className="flex items-center mt-6">
                <label className="flex items-center cursor-pointer gap-2">
                  <input
                    type="checkbox" checked={formData.isRecurring}
                    onChange={e => setFormData({...formData, isRecurring: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Despesa Fixa (Recorrente)</span>
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Categoria Select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
              <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 appearance-none">
                {activeCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Dono Select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {formData.type === 'expense' ? 'Quem deve pagar?' : 'De quem é?'}
              </label>
              <select required value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 appearance-none">
                {owners.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Método Select */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {formData.type === 'expense' ? 'Método de Pagamento' : 'Onde recebeu?'}
              </label>
              <select required value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 appearance-none">
                {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex gap-4 pt-4">
            <button
              type="button" onClick={() => navigate(-1)} // O "-1" faz voltar na tela anterior
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              Salvar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
