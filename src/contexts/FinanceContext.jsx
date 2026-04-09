import { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext(null);

const defaultCategories = [
  'Mercado', 'Necessidades', 'Eletrônicos', 'Assinaturas', 'Roupa',
  'Beleza', 'Presentes', 'Saúde', 'Despesas eventuais', 'Desenvolvimento',
  'Uber/transporte', 'IFood/restaurante', 'Lazer', 'Aluguel', 'Contas'
];

const defaultIncomeCategories = ['Salário', 'Bônus', 'Rendimentos', 'Outros'];
const defaultOwners = ['Casal (Comum)', 'Robert', 'Esposa'];
const defaultPaymentMethods = ['Cartão 1 (Fixo)', 'Cartão 2 (Variável)', 'Cartão 3 (Emergência)', 'Pix/Débito'];

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('@organizae:transactions');
    return saved ? JSON.parse(saved) : [];
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

  useEffect(() => {
    localStorage.setItem('@organizae:transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('@organizae:categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('@organizae:incomeCategories', JSON.stringify(incomeCategories));
  }, [incomeCategories]);

  useEffect(() => {
    localStorage.setItem('@organizae:owners', JSON.stringify(owners));
  }, [owners]);

  useEffect(() => {
    localStorage.setItem('@organizae:paymentMethods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('@organizae:auth', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('@organizae:auth');
  };

  const addTransaction = (transaction) => {
    setTransactions((prev) => [...prev, transaction]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        incomeCategories,
        owners,
        paymentMethods,
        isAuthenticated,
        login,
        logout,
        addTransaction,
        deleteTransaction,
        setCategories,
        setIncomeCategories,
        setOwners,
        setPaymentMethods,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
