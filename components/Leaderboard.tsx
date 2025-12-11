import React from 'react';
import { Employee } from '../types';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface LeaderboardProps {
  employees: Employee[];
  currentUserId: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ employees, currentUserId }) => {
  // Sort by points descending
  const sortedEmployees = [...employees]
    .filter(e => !e.isAdmin) // Hide admins from leaderboard
    .sort((a, b) => b.points - a.points);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="text-yellow-400 fill-current animate-bounce" size={24} />;
      case 1: return <Medal className="text-gray-400 fill-current" size={24} />;
      case 2: return <Medal className="text-amber-600 fill-current" size={24} />;
      default: return <span className="font-bold text-neutral-400 w-6 text-center">#{index + 1}</span>;
    }
  };

  const getLevel = (points: number) => {
      if (points > 1000) return { name: 'Llegenda', color: 'bg-purple-100 text-purple-700' };
      if (points > 500) return { name: 'Veterà', color: 'bg-blue-100 text-blue-700' };
      if (points > 200) return { name: 'Expert', color: 'bg-green-100 text-green-700' };
      return { name: 'Novell', color: 'bg-neutral-100 text-neutral-600' };
  }

  return (
    <div className="flex flex-col h-full bg-delagray-bg p-4 md:p-8 animate-fade-in overflow-hidden">
        <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-delagray-title flex items-center justify-center gap-2">
                <Crown className="text-delagreen" /> Rànquing de Planta
            </h2>
            <p className="text-neutral-500">Els empleats més compromesos aquest mes</p>
        </div>

        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full space-y-3 pb-20">
            {sortedEmployees.map((emp, index) => {
                const isMe = emp.id === currentUserId;
                const level = getLevel(emp.points);
                
                return (
                    <div 
                        key={emp.id} 
                        className={`flex items-center gap-4 p-4 rounded-2xl shadow-sm border transition-transform ${isMe ? 'bg-delagreen/10 border-delagreen scale-105 z-10' : 'bg-white border-neutral-100'}`}
                    >
                        <div className="font-bold text-xl flex items-center justify-center w-10">
                            {getRankIcon(index)}
                        </div>
                        
                        <div className="w-12 h-12 rounded-full bg-neutral-200 overflow-hidden border-2 border-white shadow-sm">
                             {/* Avatar placeholder or initials */}
                             <div className="w-full h-full flex items-center justify-center bg-delagreen text-white font-bold text-lg">
                                 {emp.name.charAt(0)}
                             </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className={`font-bold ${isMe ? 'text-delagreen' : 'text-delagray-title'}`}>
                                    {emp.name} {isMe && '(Tu)'}
                                </h3>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${level.color}`}>
                                    {level.name}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-400">{emp.role} • {emp.sector}</p>
                        </div>

                        <div className="text-right">
                            <p className="font-bold text-2xl text-delagray-title">{emp.points}</p>
                            <p className="text-[10px] text-neutral-400 uppercase font-bold">Punts</p>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};