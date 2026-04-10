// ----------------------------------------------------------------------------------
// ESTADO GLOBAL DO APLICATIVO (Firebase Realtime Integration)
// ----------------------------------------------------------------------------------
import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';

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
  // Estado do Usuário e Carregamento (Loading)
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Estados dos Dados (Sincronizados com Firebase)
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [budgets, setBudgets] = useState({});

  // Estados Fixos (Categorias e Opções de Select)
  const [categories] = useState(defaultCategories);
  const [incomeCategories] = useState(defaultIncomeCategories);
  const [owners] = useState(defaultOwners);
  const [paymentMethods] = useState(defaultPaymentMethods);

  // 1. MONITOR DE AUTENTICAÇÃO
  useEffect(() => {
    // Fica escutando se o usuário logou ou deslogou
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);

      // Se deslogou, zera tudo na tela por segurança
      if (!user) {
        setTransactions([]);
        setGoals([]);
        setInvestments([]);
        setBudgets({});
      }
    });
    return unsubscribe;
  }, []);

  // 2. SINCRONIZAÇÃO EM TEMPO REAL (LISTENERS DO FIRESTORE)
  // Só busca e sincroniza dados se tiver um usuário logado!
  useEffect(() => {
    if (!currentUser) return;

    const uid = currentUser.uid;

    // Escutando Transações
    const qTransactions = query(collection(db, 'transactions'), where('userId', '==', uid));
    const unSubTransactions = onSnapshot(qTransactions, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Escutando Metas
    const qGoals = query(collection(db, 'goals'), where('userId', '==', uid));
    const unSubGoals = onSnapshot(qGoals, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Escutando Investimentos
    const qInvestments = query(collection(db, 'investments'), where('userId', '==', uid));
    const unSubInvestments = onSnapshot(qInvestments, (snapshot) => {
      setInvestments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Escutando Orçamentos (Como é um único objeto/documento por usuário)
    const docBudgets = doc(db, 'budgets', uid);
    const unSubBudgets = onSnapshot(docBudgets, (docSnap) => {
      if (docSnap.exists()) {
        setBudgets(docSnap.data());
      } else {
        setBudgets({});
      }
    });

    // Quando o componente for desmontado, para de escutar o banco de dados
    return () => {
      unSubTransactions();
      unSubGoals();
      unSubInvestments();
      unSubBudgets();
    };
  }, [currentUser]);

  // -- FUNÇÕES DE AÇÃO NO BANCO DE DADOS --

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  // Funções para Transações
  const addTransaction = async (transaction) => {
    if (!currentUser) return;
    try {
      // Remove o id temporário e joga pro Firebase criar o ID real
      const { id, ...dataToSave } = transaction;
      await addDoc(collection(db, 'transactions'), { ...dataToSave, userId: currentUser.uid });
    } catch (e) {
      console.error("Erro ao adicionar transação: ", e);
    }
  };

  const deleteTransaction = async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'transactions', id));
  };

  // Funções para Metas
  const addGoal = async (goal) => {
    if (!currentUser) return;
    const { id, ...dataToSave } = goal;
    await addDoc(collection(db, 'goals'), { ...dataToSave, userId: currentUser.uid });
  };

  const updateGoal = async (id, updatedGoal) => {
    if (!currentUser) return;
    const { id: _, userId, ...dataToUpdate } = updatedGoal; // não manda id/userId no update
    await updateDoc(doc(db, 'goals', id), dataToUpdate);
  };

  const deleteGoal = async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'goals', id));
  };

  // Funções para Investimentos
  const addInvestment = async (investment) => {
    if (!currentUser) return;
    const { id, ...dataToSave } = investment;
    await addDoc(collection(db, 'investments'), { ...dataToSave, userId: currentUser.uid });
  };

  const deleteInvestment = async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'investments', id));
  };

  // Funções para Orçamentos (Budgets salva em um único documento atrelado ao UID do usuário)
  const setCategoryBudget = async (category, amount) => {
    if (!currentUser) return;
    const newBudgets = { ...budgets, [category]: amount };
    // setDoc com merge atualiza ou cria o documento se não existir
    await setDoc(doc(db, 'budgets', currentUser.uid), newBudgets, { merge: true });
  };

  return (
    <FinanceContext.Provider
      value={{
        currentUser,
        loadingAuth,
        transactions,
        goals,
        investments,
        budgets,
        categories,
        incomeCategories,
        owners,
        paymentMethods,
        isAuthenticated: !!currentUser, // booleano se está logado
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

// eslint-disable-next-line react-refresh/only-export-components
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
};
