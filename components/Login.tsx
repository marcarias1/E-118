import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (id: string, pin: string) => void;
  error?: string;
  logoUrl: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error, logoUrl }) => {
  const [id, setId] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(id, pin);
  };

  return (
    <div className="min-h-screen bg-delagray-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden p-8 animate-fade-in">
        <div className="text-center mb-8">
          <img src={logoUrl} alt="Delafruit" className="h-16 mx-auto mb-6 object-contain" />
          <p className="text-neutral-500 font-medium">Accés a empleats</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">ID Empleat</label>
            <div className="flex items-center border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus-within:ring-2 focus-within:ring-delagreen focus-within:border-transparent transition-all">
              <User className="text-neutral-400 mr-3" size={20} />
              <input 
                type="text" 
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Ex. EMP001"
                className="bg-transparent w-full outline-none font-bold text-delagray-title placeholder-neutral-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">PIN d'Accés</label>
            <div className="flex items-center border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus-within:ring-2 focus-within:ring-delagreen focus-within:border-transparent transition-all">
              <Lock className="text-neutral-400 mr-3" size={20} />
              <input 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                maxLength={6}
                className="bg-transparent w-full outline-none font-bold text-delagray-title placeholder-neutral-300 tracking-widest"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-delagreen hover:bg-delagreen-dark text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            Entrar <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-neutral-400">
          Has oblidat el PIN? Contacta amb RRHH.
        </p>
      </div>
    </div>
  );
};