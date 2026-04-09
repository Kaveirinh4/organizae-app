import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useFinance } from '../FinanceContext';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { isAuthenticated } = useFinance();
  const navigate = useNavigate();

  // Se o usuário já está logado, joga ele pro Dashboard para não ver a tela de login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Função disparada no botão "Entrar / Cadastrar"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isRegister) {
        // Firebase: Criar nova conta
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Firebase: Entrar com conta existente
        await signInWithEmailAndPassword(auth, email, password);
      }
      // O redirecionamento acontece no useEffect acima, assim que o isAuthenticated vira true!
    } catch (error) {
      console.error(error);
      // Tratamento de erros comuns em Português
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrorMsg('Este e-mail já está cadastrado.');
          break;
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setErrorMsg('E-mail ou senha incorretos.');
          break;
        case 'auth/weak-password':
          setErrorMsg('A senha é muito fraca. Digite pelo menos 6 caracteres.');
          break;
        default:
          setErrorMsg('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-2xl z-10 border border-white/20">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Nossas Contas
          </h1>
          <p className="text-slate-500 text-sm">
            {isRegister ? 'Crie sua conta para começar' : 'Suas finanças, de forma simples e compartilhada'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium flex items-center gap-2">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        <h2 className="text-2xl font-extrabold text-center text-slate-800 mb-8">
          {isRegister ? 'Criar Nova Conta' : 'Bem-vindo(a) de volta!'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required minLength={6}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Aguarde...' : (isRegister ? 'Finalizar Cadastro' : 'Entrar')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-8">
          {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
            }}
            className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {isRegister ? 'Entrar' : 'Cadastre-se'}
          </button>
        </p>

      </div>
    </div>
  );
};
