import { Navigate } from 'react-router-dom';
import { useFinance } from '../contexts/FinanceContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useFinance();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
