import { Settings } from 'lucide-react';

export const ComingSoon = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
        <Settings size={40} className="animate-[spin_4s_linear_infinite]" />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">{title}</h2>
      <p className="text-slate-500 max-w-md mx-auto">
        Estamos trabalhando duro para trazer essa funcionalidade o mais rápido possível.
        Fique ligado nas próximas atualizações!
      </p>
    </div>
  );
};
