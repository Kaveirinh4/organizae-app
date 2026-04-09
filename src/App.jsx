// O React Router é a ferramenta que cuida de qual tela vai aparecer
// dependendo do link que você acessa (ex: "/login" ou "/extrato")
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// O nosso provedor de dados globais (que criamos no FinanceContext.jsx)
import { FinanceProvider, useFinance } from './FinanceContext';

// Importamos o Componente "molde" (Cabeçalho e Menu) que fica em volta das telas
import { Layout } from './components/Layout';

// Importamos todas as nossas telas (páginas) separadas
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
// Se o usuário tentar acessar uma tela secreta mas não estiver logado,
// ele é expulso (redirecionado) para a tela de Login.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useFinance();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // "Vai pro login e não olha pra trás!"
  }
  return children; // Pode entrar!
};

// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL (Onde o App nasce)
// -----------------------------------------------------------------------------
function App() {
  return (
    // 1. Abraçamos todo o App com o FinanceProvider para que TODAS as telas
    //    possam acessar o banco de dados e os dados compartilhados.
    <FinanceProvider>

      {/* 2. Iniciamos o sistema de rotas */}
      <BrowserRouter>
        <Routes>

          {/* Rota Desprotegida (Qualquer um acessa) */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas (Só quem fez login acessa) */}
          {/* Todas as rotas abaixo vão nascer dentro do <Layout /> (Menu Lateral) */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

            {/* O "path" é a URL lá em cima no navegador. O "element" é qual arquivo de tela vai aparecer */}
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
