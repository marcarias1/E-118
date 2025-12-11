import React, { useState } from 'react';
import { Send, User, UserX, MessageSquare, CheckCircle } from 'lucide-react';

interface SuggestionBoxProps {
  onSubmit: (text: string, isAnonymous: boolean) => void;
}

export const SuggestionBox: React.FC<SuggestionBoxProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 10) return;
    
    onSubmit(text, isAnonymous);
    setSubmitted(true);
    setText('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-delagray-bg p-6 animate-fade-in">
       <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="bg-delagreen p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <MessageSquare /> Bústia de Suggeriments
                </h2>
                <p className="opacity-90 mt-2 text-sm">Ajuda'ns a millorar la planta. Guanyaràs 30 punts per cada idea constructiva.</p>
            </div>
            
            <div className="p-8">
                {submitted ? (
                    <div className="text-center py-10 animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 text-delagreen rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-delagray-title">Suggeriment Enviat!</h3>
                        <p className="text-neutral-500 mt-2">+30 Punts afegits al teu compte.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-delagray-text mb-2">La teva Proposta</label>
                            <textarea 
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full h-40 p-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-delagreen focus:border-transparent outline-none resize-none bg-neutral-50"
                                placeholder="Escriu aquí el teu suggeriment de millora, seguretat, o benestar..."
                            />
                            <p className="text-xs text-neutral-400 mt-2 text-right">Mínim 10 caràcters</p>
                        </div>

                        <div className="flex items-center justify-between bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                            <div className="flex items-center gap-3">
                                {isAnonymous ? <UserX className="text-delagreen" /> : <User className="text-delagreen" />}
                                <div>
                                    <p className="font-bold text-sm text-delagray-title">
                                        {isAnonymous ? 'Mode Anònim' : 'Mode Públic'}
                                    </p>
                                    <p className="text-xs text-neutral-400">
                                        {isAnonymous ? 'El teu nom no apareixerà.' : 'RRHH veurà el teu nom.'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-delagreen"></div>
                            </label>
                        </div>

                        <button 
                            type="submit"
                            disabled={text.trim().length < 10}
                            className="w-full py-4 bg-delagreen hover:bg-delagreen-dark disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            Enviar Suggeriment (+30 pts) <Send size={20} />
                        </button>
                    </form>
                )}
            </div>
       </div>
    </div>
  );
};