import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Employee, Reward, RedeemedReward, Sector } from '../types';
import { ArrowLeft, Coffee, Ticket, Shirt, Utensils, History, Gift, Users, CheckCircle, X, ShoppingBag, Car, Clapperboard } from 'lucide-react';

interface RewardsProps {
  employee: Employee;
  redeemedHistory: RedeemedReward[];
  onRedeem: (cost: number, rewardName: string, targetSector?: Sector, isSharedPack?: boolean) => void;
  rewards: Reward[];
}

const SECTORS: Sector[] = ['PRODUCTION', 'OFFICE', 'MARKETING'];

export const Rewards: React.FC<RewardsProps> = ({ employee, redeemedHistory, onRedeem, rewards }) => {
  const [activeQR, setActiveQR] = useState<string | null>(null);
  const [view, setView] = useState<'CATALOG' | 'HISTORY'>('CATALOG');
  
  // Modal State
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isGiftMode, setIsGiftMode] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector>('PRODUCTION');

  const initiateRedeem = (reward: Reward) => {
      // Basic check for single item cost
      if (employee.points >= reward.cost) {
          setSelectedReward(reward);
          setIsGiftMode(false);
      }
  };

  const confirmRedeem = () => {
      if (!selectedReward) return;
      
      const targetSector = isGiftMode ? selectedSector : undefined;
      onRedeem(selectedReward.cost, selectedReward.name, targetSector, isGiftMode);
      
      // Close modal
      setSelectedReward(null);
      
      if (!isGiftMode) {
        const token = `DELA-${employee.id}-${selectedReward.id}-${Date.now()}`;
        setActiveQR(token);
      } else {
        // Show QR for the user's item, and implicitly the gift is sent
        const token = `DELA-${employee.id}-${selectedReward.id}-${Date.now()}`;
        setActiveQR(token);
        // Alert handled by App.tsx console.log or we could add a toast here
      }
  };

  const getIcon = (iconName: string) => {
      switch(iconName) {
          case 'ticket': return <Ticket size={24} />;
          case 'shirt': return <Shirt size={24} />;
          case 'utensils': return <Utensils size={24} />;
          case 'sandwich': return <Utensils size={24} />;
          case 'coffee': return <Coffee size={24} />;
          case 'shopping-bag': return <ShoppingBag size={24} />;
          case 'car': return <Car size={24} />;
          case 'clapperboard': return <Clapperboard size={24} />;
          case 'gift': return <Gift size={24} />;
          default: return <Gift size={24} />;
      }
  }

  if (activeQR) {
      return (
          <div className="flex flex-col h-full bg-delagreen p-6 text-white items-center justify-center text-center animate-fade-in rounded-3xl">
              <h2 className="text-3xl font-bold mb-8">Bescanvi Èxitós!</h2>
              <div className="bg-white p-6 rounded-3xl shadow-2xl mb-8 transform hover:scale-105 transition-transform">
                  <QRCode value={activeQR} size={220} />
              </div>
              <p className="mb-2 text-xl font-bold">Mostra aquest codi</p>
              <p className="mb-8 text-delagreen-light text-sm opacity-80">Vàlid per 15 minuts</p>
              {isGiftMode && (
                  <div className="mb-8 bg-purple-600 px-4 py-2 rounded-lg text-sm font-bold animate-pulse">
                      ¡Regal enviat al company! 🎁
                  </div>
              )}
              <button 
                onClick={() => setActiveQR(null)}
                className="bg-white text-delagreen font-bold py-3 px-10 rounded-full shadow-lg hover:bg-neutral-100 transition-colors"
              >
                  Tancar
              </button>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-full bg-delagray-bg relative">
      
      {/* CONFIRMATION MODAL */}
      {selectedReward && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-delagray-title">Confirmar Bescanvi</h3>
                      <button onClick={() => setSelectedReward(null)} className="text-neutral-400 hover:text-black">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-xl mb-6">
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-delagreen shadow-sm border border-neutral-100">
                          {getIcon(selectedReward.icon)}
                      </div>
                      <div>
                          <p className="font-bold text-lg text-delagray-title">{selectedReward.name}</p>
                          <p className="text-delagreen font-bold">{selectedReward.cost} punts / unitat</p>
                      </div>
                  </div>

                  <div className="space-y-4 mb-8">
                      <p className="text-sm font-bold text-neutral-500 uppercase">Tria una opció:</p>
                      
                      <button 
                        onClick={() => setIsGiftMode(false)}
                        className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${!isGiftMode ? 'border-delagreen bg-green-50 text-delagreen' : 'border-neutral-200 text-neutral-400'}`}
                      >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!isGiftMode ? 'border-delagreen' : 'border-neutral-300'}`}>
                              {!isGiftMode && <div className="w-3 h-3 bg-delagreen rounded-full" />}
                          </div>
                          <div className="text-left flex-1">
                                <span className="font-bold block">Només per a mi</span>
                                <span className="text-xs">Cost total: <span className="font-bold">{selectedReward.cost} pts</span></span>
                          </div>
                      </button>

                      <button 
                        onClick={() => setIsGiftMode(true)}
                        // Costs same, so no extra check needed besides base cost
                        className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${isGiftMode ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-neutral-200 text-neutral-400'}`}
                      >
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isGiftMode ? 'border-purple-500' : 'border-neutral-300'}`}>
                              {isGiftMode && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
                          </div>
                          <div className="text-left flex-1">
                              <span className="font-bold block flex items-center gap-2"><Gift size={16}/> Pack Compartir (Regal Inclòs!)</span>
                              <span className="text-xs font-normal">Un per a tu, un GRATIS per a un company.</span>
                              <div className="text-xs mt-1">Cost total: <span className="font-bold text-delagreen">{selectedReward.cost} pts</span> <span className="line-through opacity-50 text-[10px]">{selectedReward.cost * 2}</span></div>
                          </div>
                      </button>

                      {isGiftMode && (
                          <div className="mt-2 pl-2 animate-fade-in">
                              <label className="text-xs font-bold text-neutral-400 block mb-2">Selecciona Departament Destí del Regal:</label>
                              <select 
                                value={selectedSector}
                                onChange={(e) => setSelectedSector(e.target.value as Sector)}
                                className="w-full p-3 bg-white border border-neutral-300 rounded-lg font-bold text-delagray-title outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                  {SECTORS.map(s => (
                                      <option key={s} value={s}>{s}</option>
                                  ))}
                              </select>
                          </div>
                      )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setSelectedReward(null)}
                        className="py-3 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
                      >
                          Cancel·lar
                      </button>
                      <button 
                        onClick={confirmRedeem}
                        className={`py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${isGiftMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-delagreen hover:bg-delagreen-dark'}`}
                      >
                          {isGiftMode ? 'Bescanviar i Regalar' : 'Confirmar'}
                      </button>
                  </div>
              </div>
          </div>
      )}


      <div className="p-6 md:p-8 space-y-6 overflow-y-auto pb-24">
        
        {/* Points Card */}
        <div className="bg-delagreen text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-delagreen-light mb-1">Saldo Disponible</p>
                <h1 className="text-5xl font-bold">{employee.points} pts</h1>
             </div>
             <Ticket className="absolute -right-6 -bottom-6 text-white opacity-10" size={140} />
        </div>
        
        {/* Tabs */}
        <div className="flex gap-4 border-b border-neutral-200 pb-2">
            <button 
                onClick={() => setView('CATALOG')}
                className={`flex items-center gap-2 pb-2 font-bold transition-all ${view === 'CATALOG' ? 'text-delagreen border-b-2 border-delagreen' : 'text-neutral-400'}`}
            >
                <Gift size={20} /> Catàleg
            </button>
            <button 
                onClick={() => setView('HISTORY')}
                className={`flex items-center gap-2 pb-2 font-bold transition-all ${view === 'HISTORY' ? 'text-delagreen border-b-2 border-delagreen' : 'text-neutral-400'}`}
            >
                <History size={20} /> Historial
            </button>
        </div>

        {view === 'CATALOG' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {rewards.map(reward => {
                    const canAfford = employee.points >= reward.cost;
                    return (
                        <div key={reward.id} className={`group bg-white rounded-2xl p-5 border transition-all hover:shadow-lg ${canAfford ? 'border-neutral-200' : 'border-neutral-100 opacity-60'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${canAfford ? 'bg-delagreen-light text-delagreen' : 'bg-neutral-100 text-neutral-400'}`}>
                                    {getIcon(reward.icon)}
                                </div>
                                <span className={`font-bold text-lg ${canAfford ? 'text-delagreen' : 'text-neutral-400'}`}>
                                    {reward.cost} pts
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-lg text-delagray-title mb-1">{reward.name}</h3>
                            <p className="text-sm text-neutral-500 mb-4 h-10 leading-snug">{reward.description}</p>
                            
                            <button
                                disabled={!canAfford}
                                onClick={() => initiateRedeem(reward)}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                                    canAfford 
                                    ? 'bg-delagreen text-white hover:bg-delagreen-dark shadow-md group-hover:scale-[1.02]' 
                                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                }`}
                            >
                                {canAfford ? 'Bescanviar' : `Falten ${reward.cost - employee.points} pts`}
                            </button>
                        </div>
                    )
                })}
            </div>
        ) : (
            <div className="space-y-4 animate-fade-in">
                {redeemedHistory.length === 0 ? (
                    <p className="text-center text-neutral-400 py-10">No has bescanviat premis encara.</p>
                ) : (
                    redeemedHistory.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-neutral-200 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.isGift ? 'bg-purple-100 text-purple-600' : 'bg-neutral-100 text-neutral-400'}`}>
                                    {item.isGift ? <Gift size={20} /> : <Ticket size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-delagray-title">{item.rewardName}</h4>
                                    <p className="text-xs text-neutral-400">
                                        {new Date(item.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                {item.cost > 0 ? (
                                    <span className="text-delagreen font-bold">-{item.cost} pts</span>
                                ) : (
                                    <span className="text-purple-600 font-bold">REGAL</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};