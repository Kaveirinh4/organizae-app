import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './contexts/FinanceContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { AddTransaction } from './pages/AddTransaction';
import { ComingSoon } from './pages/ComingSoon';
import { Goals } from './pages/Goals';
import { Investments } from './pages/Investments';
import { Analytics } from './pages/Analytics';

function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/settings" element={<ComingSoon title="Configurações em Breve" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FinanceProvider>
  );
}

export default App;
