// ----------------------------------------------------------------------------------
// ESTADO GLOBAL DO APLICATIVO (Onde os dados vivem)
// ----------------------------------------------------------------------------------
// Pense neste arquivo como o "Coração" ou a "Memória" do seu aplicativo.
// Em vez de passar dados de tela em tela de forma complicada, nós guardamos tudo aqui.
// Qualquer tela do aplicativo pode "pedir" dados para este contexto usando a função `useFinance()`.

import { createContext, useContext, useState, useEffect } from 'react';

// 1. Criamos a "caixa" onde guardaremos as informações
const FinanceContext = createContext(null);

// 2. Valores Padrão Iniciais (Caso seja o primeiro acesso do usuário)
const defaultCategories = [
  'Mercado', 'Necessidades', 'Eletrônicos', 'Assinaturas', 'Roupa',
  'Beleza', 'Presentes', 'Saúde', 'Despesas eventuais', 'Desenvolvimento',
  'Uber/transporte', 'IFood/restaurante', 'Lazer', 'Aluguel', 'Contas'
];
const defaultIncomeCategories = ['Salário', 'Bônus', 'Rendimentos', 'Outros'];
const defaultOwners = ['Casal (Comum)', 'Robert', 'Esposa'];
const defaultPaymentMethods = ['Cartão 1 (Fixo)', 'Cartão 2 (Variável)', 'Cartão 3 (Emergência)', 'Pix/Débito'];

// 3. O "Provedor" é quem vai abraçar todo o nosso App lá no App.jsx e distribuir os dados
export const FinanceProvider = ({ children }) => {

  // -- VARIÁVEIS DE ESTADO (Dados do App) --
  // Usamos useState com uma função inicial para tentar buscar os dados salvos no navegador (localStorage).
  // Se não achar nada (app zerado), usamos listas vazias ou os valores padrão acima.
  // IMPORTANTE: Quando o Firebase for ativado, você trocará essa lógica por buscas no Firestore!

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('@organizae:transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('@organizae:goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [investments, setInvestments] = useState(() => {
    const saved = localStorage.getItem('@organizae:investments');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('@organizae:budgets');
    return saved ? JSON.parse(saved) : {};
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('@organizae:categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  const [incomeCategories, setIncomeCategories] = useState(() => {
    const saved = localStorage.getItem('@organizae:incomeCategories');
    return saved ? JSON.parse(saved) : defaultIncomeCategories;
  });

  const [owners, setOwners] = useState(() => {
    const saved = localStorage.getItem('@organizae:owners');
    return saved ? JSON.parse(saved) : defaultOwners;
  });

  const [paymentMethods, setPaymentMethods] = useState(() => {
    const saved = localStorage.getItem('@organizae:paymentMethods');
    return saved ? JSON.parse(saved) : defaultPaymentMethods;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('@organizae:auth') === 'true';
  });


  // -- EFEITOS COLATERAIS (Salvando Dados) --
  // O useEffect "observa" uma variável. Toda vez que a variável muda, ele roda o código dentro dele.
  // Aqui estamos dizendo: "Toda vez que a lista de transações mudar, salve a nova lista no navegador."
  // Se você usar o Firebase, esses arquivos poderão ser removidos, pois o Firebase salva online.
  useEffect(() => { localStorage.setItem('@organizae:transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('@organizae:goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('@organizae:investments', JSON.stringify(investments)); }, [investments]);
  useEffect(() => { localStorage.setItem('@organizae:budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('@organizae:categories', JSON.stringify(categories)); }, [categories]);


  // -- REGRAS DE NEGÓCIO E FUNÇÕES DE MODIFICAÇÃO --
  // Em vez de cada tela ter que inventar como salvar algo, nós criamos funções prontas aqui.
  // As telas apenas chamam essas funções.

  // Autenticação (Login e Logout simulados)
  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('@organizae:auth', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('@organizae:auth');
  };

  // Funções para Transações (Lançamentos e Receitas)
  const addTransaction = (transaction) => {
    // Pega a lista anterior (prev) e adiciona a nova transação no final.
    setTransactions((prev) => [...prev, transaction]);
  };
  const deleteTransaction = (id) => {
    // Filtra a lista removendo o item que tem o ID selecionado.
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Funções para Metas Financeiras
  const addGoal = (goal) => setGoals((prev) => [...prev, goal]);
  const updateGoal = (id, updatedGoal) => setGoals((prev) => prev.map((g) => (g.id === id ? updatedGoal : g)));
  const deleteGoal = (id) => setGoals((prev) => prev.filter((g) => g.id !== id));

  // Funções para Investimentos
  const addInvestment = (investment) => setInvestments((prev) => [...prev, investment]);
  const deleteInvestment = (id) => setInvestments((prev) => prev.filter((i) => i.id !== id));

  // Funções para Orçamentos
  const setCategoryBudget = (category, amount) => {
    // Mantém o objeto de orçamentos anterior, e apenas atualiza o valor da categoria escolhida.
    setBudgets((prev) => ({ ...prev, [category]: amount }));
  };

  // 4. Retornamos o Provedor. Tudo que estiver dentro do "value" estará disponível para o aplicativo inteiro!
  return (
    <FinanceContext.Provider
      value={{
        // Variáveis que as telas podem ler
        transactions,
        goals,
        investments,
        budgets,
        categories,
        incomeCategories,
        owners,
        paymentMethods,
        isAuthenticated,
        // Funções que as telas podem usar para modificar os dados
        login,
        logout,
        addTransaction,
        deleteTransaction,
        addGoal,
        updateGoal,
        deleteGoal,
        addInvestment,
        deleteInvestment,
        setCategoryBudget,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

// 5. Esta é a ferramenta mágica que criamos para as telas usarem.
// Exemplo de uso em uma tela: const { transactions } = useFinance();
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
};
