import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { useFinance } from '../FinanceContext';

export const Extrato = () => {
  // Puxa as transações e a função de deletar do Contexto
  const { transactions, deleteTransaction } = useFinance();

  // Estado local apenas para saber qual aba o usuário clicou
  const [filter, setFilter] = useState('all'); // Pode ser: 'all', 'income' ou 'expense'

  // Filtramos a lista de transações com base no botão que o usuário clicou.
  // Depois, nós ".sort()" que serve para ordenar, garantindo que a data mais recente fique no topo.
  const filteredTransactions = transactions
    .filter(t => filter === 'all' ? true : t.type === filter)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Função para formatar como dinheiro
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  // Função para formatar a data (transforma "2024-06-15" em "15 de Junho")
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "dd 'de' MMMM", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">

      {/* CABEÇALHO DO EXTRATO E BOTÕES DE FILTRO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Histórico de Lançamentos</h2>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'income' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Receitas
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'expense' ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Despesas
          </button>
        </div>
      </div>

      {/* LISTA DE TRANSAÇÕES */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

        {/* Se a lista estiver vazia (tamanho zero), mostra a mensagem de erro */}
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Filter size={48} className="mx-auto mb-4 opacity-20" />
            <p>Nenhum lançamento encontrado.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {/* O comando .map() é como um "para cada", ele desenha um item na tela para cada transação na lista */}
            {filteredTransactions.map((t) => (
              <li key={t.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors group flex items-center justify-between gap-4">

                <div className="flex items-center gap-4 flex-1">
                  {/* Ícone verde ou vermelho dependendo se é receita ou despesa */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{t.description}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-2 truncate mt-0.5">
                      <span>{formatDate(t.date)}</span>
                      <span>•</span>
                      <span>{t.category}</span>
                      <span>•</span>
                      <span>{t.owner}</span>
                    </p>
                  </div>
                </div>

                {/* Valor e botão de deletar (Lixeira) */}
                <div className="flex flex-col items-end gap-2">
                  <span className={`font-bold whitespace-nowrap ${
                    t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </span>

                  {/* Ao clicar na lixeira, chamamos a função do contexto passando o ID da transação */}
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
