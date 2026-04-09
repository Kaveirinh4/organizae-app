// O React Router é a ferramenta que cuida de qual tela vai aparecer
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider, useFinance } from './FinanceContext';
import { Layout } from './components/Layout';

// Importamos todas as nossas telas
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Extrato } from './pages/Extrato';
import { NovoLancamento } from './pages/NovoLancamento';
import { Analise } from './pages/Analise';
import { Metas } from './pages/Metas';
import { Investimentos } from './pages/Investimentos';


// -----------------------------------------------------------------------------
// COMPONENTE DE PROTEÇÃO DE ROTA
// -----------------------------------------------------------------------------
// Esse componente funciona como um "Segurança de Porta".
// Ele verifica se o Firebase já terminou de carregar a autenticação e,
// se o usuário não estiver logado, redireciona para a página de Login.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loadingAuth } = useFinance();

  // Enquanto o Firebase verifica quem é o usuário, mostramos uma tela de loading simples
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-indigo-600">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 font-semibold">Carregando seus dados...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // "Vai pro login e não olha pra trás!"
  }

  return children; // Pode entrar!
};

// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------------------------------
function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota Desprotegida (Login/Cadastro) */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas (Só quem fez login acessa) */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/extrato" element={<Extrato />} />
            <Route path="/novo-lancamento" element={<NovoLancamento />} />
            <Route path="/analise" element={<Analise />} />
            <Route path="/metas" element={<Metas />} />
            <Route path="/investimentos" element={<Investimentos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FinanceProvider>
  );
}

export default App;
