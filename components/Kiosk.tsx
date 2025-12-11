import React, { useEffect, useState, useMemo } from 'react';
import { Employee, NewsArticle, Reward } from '../types';
import { Clock, Fingerprint, Target, CheckCircle, Lock } from 'lucide-react';

interface KioskProps {
  employees: Employee[]; 
  recentNews: NewsArticle[];
  rewards: Reward[]; // Need rewards to calculate gap
  onExitKiosk: () => void;
}

export const Kiosk: React.FC<KioskProps> = ({ employees, recentNews, rewards, onExitKiosk }) => {
  const [time, setTime] = useState(new Date());
  const [scannedUser, setScannedUser] = useState<Employee | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateScan = () => {
    const randomEmp = employees.filter(e => !e.isAdmin)[Math.floor(Math.random() * (employees.length - 1))]; // Don't scan admin
    if(randomEmp) {
        setScannedUser(randomEmp);
        setTimeout(() => setScannedUser(null), 5000);
    }
  };

  // Calculate "Next Reward Gap"
  const nextGoal = useMemo(() => {
      if (!scannedUser) return null;
      const sortedRewards = [...rewards].sort((a, b) => a.cost - b.cost);
      const nextTarget = sortedRewards.find(r => r.cost > scannedUser.points);
      
      if (nextTarget) {
          return {
              name: nextTarget.name,
              missing: nextTarget.cost - scannedUser.points
          };
      }
      return null;
  }, [scannedUser, rewards]);

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
        
        <div className="absolute top-0 w-full p-6 flex justify-between items-center text-neutral-400 z-10">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm tracking-widest uppercase">Sistema NFC Actiu</span>
            </div>
            <button onClick={onExitKiosk} className="opacity-20 hover:opacity-100 transition-opacity">Sortir</button>
        </div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative">
        
        <div className="bg-delagreen p-10 text-white flex justify-between items-end">
             <div>
                 <h1 className="text-6xl font-bold">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h1>
                 <p className="text-xl opacity-90 mt-2">{time.toLocaleDateString('ca-ES', {weekday: 'long', day: 'numeric', month: 'long'})}</p>
             </div>
             <div className="text-right opacity-80">
                 <p className="text-sm uppercase tracking-widest">Delafruit Planta 1</p>
                 <Fingerprint size={48} className="ml-auto opacity-50" />
             </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center relative">
            
            {scannedUser ? (
                <div className="animate-fade-in space-y-8 max-w-2xl">
                    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-4xl font-bold text-delagray-title">Hola, {scannedUser.name.split(' ')[0]}!</h2>
                    <p className="text-2xl text-neutral-500">Entrada registrada a les {time.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                    
                    {/* GAMIFICATION TRAP: Don't show total, show gap */}
                    <div className="bg-neutral-50 border-2 border-delagreen/20 p-8 rounded-2xl shadow-lg mt-4">
                        {nextGoal ? (
                            <div>
                                <p className="text-neutral-500 font-bold uppercase text-sm mb-2 flex items-center justify-center gap-2">
                                    <Target size={16} /> Pròxim Objectiu
                                </p>
                                <p className="text-5xl font-bold text-delagreen mb-2">{nextGoal.missing} pts</p>
                                <p className="text-lg text-delagray-title">
                                    necessaris per aconseguir <br/>
                                    <span className="font-bold underline">{nextGoal.name}</span>
                                </p>
                                <p className="text-xs text-neutral-400 mt-4">
                                    Entra a l'App Newsletter per veure el teu saldo total.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-2xl font-bold text-delagreen">Tens punts per a tot!</p>
                                <p className="text-neutral-500">Consulta l'App per bescanviar.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                     <div 
                        onClick={handleSimulateScan}
                        className="w-48 h-48 mx-auto rounded-full bg-neutral-50 border-4 border-dashed border-neutral-300 flex items-center justify-center text-neutral-300 hover:border-delagreen hover:text-delagreen hover:bg-green-50 transition-all cursor-pointer active:scale-95 group"
                     >
                         <div className="text-center">
                            <Fingerprint size={64} className="mx-auto mb-2" />
                            <span className="text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">SIMULAR NFC</span>
                         </div>
                     </div>
                     <div>
                        <h2 className="text-3xl font-bold text-delagray-title mb-2">Apropa la teva targeta d'empleat</h2>
                        <p className="text-neutral-400">Fitxatge obligatori d'entrada</p>
                     </div>
                </div>
            )}
        </div>

        <div className="bg-neutral-900 text-neutral-400 p-4 overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-marquee">
                <span className="mx-4 text-delagreen font-bold">NOVETATS:</span>
                {recentNews.map(n => (
                    <span key={n.id} className="mx-8">
                        {n.title} <span className="text-neutral-600 mx-2">|</span>
                    </span>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};