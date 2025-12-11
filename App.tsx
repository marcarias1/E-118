import React, { useState, useMemo, useEffect } from 'react';
import { Kiosk } from './components/Kiosk';
import { Login } from './components/Login';
import { NewsFeed } from './components/NewsFeed';
import { ArticleReader } from './components/ArticleReader';
import { Rewards } from './components/Rewards';
import { SuggestionBox } from './components/SuggestionBox';
import { AdminDashboard } from './components/AdminDashboard';
import { Leaderboard } from './components/Leaderboard';
import { AppState, Employee, NewsArticle, DashboardTab, Reward, Suggestion, RedeemedReward, SuggestionStatus, Sector } from './types';
import { LayoutGrid, Newspaper, Gift, LogOut, Monitor, Smartphone, Target, MessageSquare, BarChart3, Crown, Star } from 'lucide-react';
import { db } from './services/db';

const LOGO_URL = "https://static.wixstatic.com/media/dad81e_fc67726f01c348c09d26233194c9a221~mv2.jpg/v1/crop/x_21,y_0,w_5707,h_2512/fill/w_276,h_121,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/DELAFRUIT%20BY%20ANDROS.jpg";

const MOCK_REWARDS: Reward[] = [
    { id: '1', name: 'Cafè Prèmium', cost: 100, icon: 'coffee', description: 'Vàlid a qualsevol màquina de la planta.', category: 'FOOD' },
    { id: '2', name: 'Entrepà Menjador', cost: 250, icon: 'sandwich', description: 'Entrepà a elecció (Fred o Calent).', category: 'FOOD' },
    { id: '3', name: 'Val 15€ ALDI', cost: 1500, icon: 'shopping-bag', description: 'Targeta regal per a supermercats.', category: 'FOOD' },
    { id: '4', name: 'Pack Cinema (2 Entrades)', cost: 1800, icon: 'clapperboard', description: 'Vàlid per a Cinesa o Yelmo.', category: 'LEISURE' },
    { id: '5', name: 'Xec 20€ Amazon', cost: 2000, icon: 'gift', description: 'Codi digital per a compres online.', category: 'MERCH' },
    { id: '6', name: 'Targeta Repsol 20€', cost: 2000, icon: 'car', description: 'Per a combustible o botiga.', category: 'MERCH' },
    { id: '7', name: 'Entrada Port Aventura', cost: 5000, icon: 'ticket', description: 'Entrada d\'1 dia per a adult.', category: 'LEISURE' },
    { id: '8', name: 'Dia Lliure Extra', cost: 10000, icon: 'calendar', description: 'Subjecte a aprovació de RRHH.', category: 'LEISURE' },
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    appMode: 'LANDING_SELECTION',
    isAuthenticated: false,
    currentUser: null,
    activeTab: 'YOUR_SECTOR',
    selectedArticleId: null,
    employees: [],
    news: [],
    suggestions: [],
    redemptionHistory: {}
  });

  const [loginError, setLoginError] = useState('');

  // Load Data from DB on Mount
  useEffect(() => {
    setState(prev => ({
        ...prev,
        employees: db.getEmployees(),
        news: db.getNews(),
        suggestions: db.getSuggestions()
    }));
  }, []);

  // --- LOGIC: GOAL CALCULATION ---
  const nextRewardGoal = useMemo(() => {
      if (!state.currentUser) return null;
      const points = state.currentUser.points;
      const sortedRewards = [...MOCK_REWARDS].sort((a, b) => a.cost - b.cost);
      const nextTarget = sortedRewards.find(r => r.cost > points);
      
      if (nextTarget) {
          return {
              target: nextTarget,
              missing: nextTarget.cost - points
          };
      }
      return null;
  }, [state.currentUser]);

  // --- LEVEL CALCULATION ---
  const userLevel = useMemo(() => {
      if (!state.currentUser) return { name: 'N/A', progress: 0 };
      const points = state.currentUser.points;
      if (points < 200) return { name: 'Novell', progress: (points / 200) * 100 };
      if (points < 500) return { name: 'Expert', progress: ((points - 200) / 300) * 100 };
      if (points < 1000) return { name: 'Veterà', progress: ((points - 500) / 500) * 100 };
      return { name: 'Llegenda', progress: 100 };
  }, [state.currentUser]);

  // --- ACTIONS ---

  const handleLogin = (id: string, pin: string) => {
      const user = db.login(id, pin);
      
      if (user) {
          // Load User History
          const history = db.getRedemptions(user.id);
          
          setState(prev => ({ 
              ...prev, 
              isAuthenticated: true, 
              currentUser: user,
              currentView: 'DASHBOARD',
              activeTab: user.isAdmin ? 'ADMIN_DASHBOARD' : 'YOUR_SECTOR',
              redemptionHistory: { ...prev.redemptionHistory, [user.id]: history }
          }));
          setLoginError('');
      } else {
          setLoginError('ID o PIN incorrecte. (Prova rootclient/root o rootadmin/root)');
      }
  };

  const handleLogout = () => {
      setState(prev => ({ 
          ...prev, 
          isAuthenticated: false, 
          currentUser: null, 
          activeTab: 'YOUR_SECTOR',
          appMode: 'LANDING_SELECTION' 
      }));
  };

  const handleVote = (articleId: string, pointsEarned: number) => {
    if (!state.currentUser) return;
    
    const result = db.voteArticle(state.currentUser.id, articleId, pointsEarned);
    if (result) {
        setState(prev => ({
            ...prev,
            currentUser: result.user,
            employees: db.getEmployees(), // Refresh all for leaderboard
            news: result.news,
            activeTab: 'YOUR_SECTOR',
            selectedArticleId: null
        }));
    }
  };

  const handleRedeem = (cost: number, rewardName: string, targetSector?: Sector, isSharedPack?: boolean) => {
      if (!state.currentUser) return;
      try {
          const result = db.redeemReward(state.currentUser.id, rewardName, cost, targetSector, isSharedPack);
          
          // Refresh state
          const history = db.getRedemptions(state.currentUser.id);
          
          if (result.giftedTo) {
             console.log(`Regal enviat a ${result.giftedTo}`);
          }

          setState(prev => ({ 
              ...prev, 
              currentUser: result.user, 
              employees: db.getEmployees(),
              redemptionHistory: {
                  ...prev.redemptionHistory,
                  [prev.currentUser!.id]: history
              }
           }));
      } catch (e) {
          alert("Error al bescanviar: " + (e as Error).message);
      }
  };

  const handleSuggestion = (text: string, isAnonymous: boolean) => {
      if(!state.currentUser) return;
      
      const result = db.addSuggestion(text, isAnonymous, state.currentUser.name);
      
      setState(prev => ({
          ...prev,
          suggestions: result.suggestions,
          currentUser: result.user && result.user.id === prev.currentUser?.id ? result.user : prev.currentUser,
          employees: db.getEmployees()
      }));
  };

  const handleUpdateSuggestionStatus = (id: string, status: SuggestionStatus) => {
      const updatedSuggestions = db.updateSuggestionStatus(id, status);
      setState(prev => ({ ...prev, suggestions: updatedSuggestions }));
  };

  const handleDeleteSuggestion = (id: string) => {
      const updatedSuggestions = db.deleteSuggestion(id);
      setState(prev => ({ ...prev, suggestions: updatedSuggestions }));
  };

  const handleCreateArticle = (article: any) => {
      const updatedNews = db.createArticle(article);
      setState(prev => ({ ...prev, news: updatedNews }));
  };

  // --- RENDERERS ---

  if (state.appMode === 'LANDING_SELECTION') {
      return (
          <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 font-sans">
              <div className="max-w-2xl w-full grid md:grid-cols-2 gap-6">
                  <button onClick={() => setState(prev => ({...prev, appMode: 'KIOSK_MODE'}))} className="bg-neutral-800 hover:bg-neutral-700 p-8 rounded-3xl border border-neutral-700 text-left group transition-all">
                      <div className="bg-delagreen w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                          <Monitor size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Terminal Quiosc</h2>
                      <p className="text-neutral-400">Entrada Fàbrica (NFC)</p>
                  </button>

                  <button onClick={() => setState(prev => ({...prev, appMode: 'MOBILE_APP_MODE'}))} className="bg-white hover:bg-neutral-50 p-8 rounded-3xl border border-neutral-200 text-left group transition-all">
                      <div className="bg-delagreen w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                          <Smartphone size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-delagray-title mb-2">App Newsletter</h2>
                      <p className="text-neutral-500">Mòbil / PC (Usuaris i Admin)</p>
                  </button>
              </div>
          </div>
      )
  }

  if (state.appMode === 'KIOSK_MODE') {
      return (
          <Kiosk 
            employees={state.employees} 
            recentNews={state.news}
            rewards={MOCK_REWARDS}
            onExitKiosk={() => setState(prev => ({...prev, appMode: 'LANDING_SELECTION'}))}
          />
      );
  }

  if (!state.isAuthenticated) {
      return <Login onLogin={handleLogin} error={loginError} logoUrl={LOGO_URL} />;
  }

  const NavItem = ({ tab, label, icon: Icon }: { tab: DashboardTab, label: string, icon: any }) => (
      <button 
        onClick={() => setState(prev => ({...prev, activeTab: tab, selectedArticleId: null}))}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left font-medium ${state.activeTab === tab ? 'bg-delagreen text-white shadow-lg translate-x-1' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
      >
          <Icon size={20} />
          <span className="hidden md:inline">{label}</span>
          <span className="md:hidden text-xs">{label}</span>
      </button>
  );
  
  const MobileNavItem = ({ tab, label, icon: Icon }: { tab: DashboardTab, label: string, icon: any }) => (
    <button 
      onClick={() => setState(prev => ({...prev, activeTab: tab, selectedArticleId: null}))}
      className={`flex flex-col items-center justify-center p-2 flex-1 transition-all ${state.activeTab === tab ? 'text-delagreen' : 'text-neutral-400'}`}
    >
        <div className={`p-1 rounded-full mb-1 ${state.activeTab === tab ? 'bg-delagreen-light' : ''}`}>
            <Icon size={24} className={state.activeTab === tab ? 'fill-current' : ''} />
        </div>
        <span className="text-[10px] font-bold">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-delagray-bg font-sans overflow-hidden">
        {/* Desktop Sidebar (Dark Mode Redesign) */}
        <aside className="hidden md:flex w-72 flex-col bg-neutral-900 text-white shadow-2xl z-20">
            <div className="p-8 pb-4">
                <div className="bg-white rounded-xl p-3 shadow-inner">
                    <img src={LOGO_URL} alt="Delafruit Logo" className="w-full h-auto object-contain" />
                </div>
            </div>
            
            <nav className="flex-1 px-4 space-y-2">
                {state.currentUser?.isAdmin ? (
                    <NavItem tab="ADMIN_DASHBOARD" label="Panell Admin" icon={BarChart3} />
                ) : (
                    <>
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-4 mb-2 mt-4">Menú</p>
                        <NavItem tab="YOUR_SECTOR" label="El teu Sector" icon={LayoutGrid} />
                        <NavItem tab="ALL_NEWS" label="Notícies" icon={Newspaper} />
                        <NavItem tab="REWARDS" label="Recompenses" icon={Gift} />
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-4 mb-2 mt-6">Comunitat</p>
                        <NavItem tab="SUGGESTIONS" label="Bústia" icon={MessageSquare} />
                        <NavItem tab="LEADERBOARD" label="Rànquing" icon={Crown} />
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-neutral-800 bg-black/20">
                {!state.currentUser?.isAdmin && (
                    <>
                        <div className="mb-4 px-2">
                            <div className="flex justify-between text-xs font-bold uppercase text-neutral-400 mb-1">
                                <span>{userLevel.name}</span>
                                <span className="text-white">{state.currentUser!.points} pts</span>
                            </div>
                            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-delagreen rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(46,139,87,0.5)]" style={{width: `${userLevel.progress}%`}}></div>
                            </div>
                        </div>

                        <div className="bg-neutral-800 p-3 rounded-xl mb-4 relative overflow-hidden group cursor-pointer hover:bg-neutral-700 transition-colors" onClick={() => setState(prev => ({...prev, activeTab: 'REWARDS'}))}>
                            {nextRewardGoal ? (
                                <div className="relative z-10">
                                    <p className="text-[10px] text-neutral-400 uppercase font-bold mb-1 flex items-center gap-1">
                                        <Target size={10} /> Següent: {nextRewardGoal.target.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-delagreen whitespace-nowrap">Falten {nextRewardGoal.missing} pts</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm font-bold text-delagreen flex items-center gap-2"><Star className="fill-current" size={16}/> Objectiu completat!</p>
                            )}
                        </div>
                    </>
                )}
                
                <div className="flex items-center gap-3 px-2 mt-2">
                    <div className="w-10 h-10 bg-delagreen rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-neutral-800">
                        {state.currentUser?.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate text-white">{state.currentUser?.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{state.currentUser?.role}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="mt-4 flex items-center gap-2 text-xs text-neutral-500 hover:text-white w-full px-2 transition-colors">
                    <LogOut size={14} /> Tancar Sessió
                </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            <header className="md:hidden bg-white p-4 shadow-sm z-20 flex justify-between items-center">
                <img src={LOGO_URL} alt="Delafruit" className="h-8 w-auto object-contain" />
                <div className="flex items-center gap-2">
                     <div className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-200 flex items-center gap-1">
                         <Crown size={12} /> {state.currentUser?.points}
                     </div>
                     <button onClick={handleLogout}><LogOut size={20} className="text-neutral-400" /></button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative">
                {state.activeTab === 'ADMIN_DASHBOARD' && (
                    <AdminDashboard 
                        news={state.news} 
                        suggestions={state.suggestions} 
                        onUpdateStatus={handleUpdateSuggestionStatus}
                        onDeleteSuggestion={handleDeleteSuggestion}
                        onCreateArticle={handleCreateArticle}
                    />
                )}

                {(state.activeTab === 'YOUR_SECTOR' || state.activeTab === 'ALL_NEWS') && (
                     <NewsFeed 
                        news={state.news} 
                        employee={state.currentUser!} 
                        filter={state.activeTab === 'YOUR_SECTOR' ? 'SECTOR' : 'ALL'}
                        onSelectArticle={(id) => setState(prev => ({ ...prev, selectedArticleId: id, activeTab: 'ARTICLE_READ' }))} 
                    />
                )}

                {state.activeTab === 'REWARDS' && (
                    <Rewards 
                        employee={state.currentUser!} 
                        redeemedHistory={state.redemptionHistory[state.currentUser!.id] || []}
                        onRedeem={handleRedeem}
                        rewards={MOCK_REWARDS}
                    />
                )}

                {state.activeTab === 'SUGGESTIONS' && (
                    <SuggestionBox onSubmit={handleSuggestion} />
                )}

                {state.activeTab === 'LEADERBOARD' && (
                    <Leaderboard employees={state.employees} currentUserId={state.currentUser!.id} />
                )}

                {state.activeTab === 'ARTICLE_READ' && state.selectedArticleId && (
                    <div className="absolute inset-0 bg-delagray-bg z-30 overflow-y-auto">
                        <ArticleReader 
                            article={state.news.find(n => n.id === state.selectedArticleId)!}
                            onBack={() => setState(prev => ({ ...prev, activeTab: 'YOUR_SECTOR', selectedArticleId: null }))}
                            onVote={handleVote}
                            alreadyVoted={state.news.find(n => n.id === state.selectedArticleId)!.readBy.includes(state.currentUser!.id)}
                        />
                    </div>
                )}
            </div>

            <nav className="md:hidden bg-white border-t border-neutral-200 flex justify-around p-2 pb-safe z-20 overflow-x-auto">
                {state.currentUser?.isAdmin ? (
                     <MobileNavItem tab="ADMIN_DASHBOARD" label="Admin" icon={BarChart3} />
                ) : (
                    <>
                        <MobileNavItem tab="YOUR_SECTOR" label="Inici" icon={LayoutGrid} />
                        <MobileNavItem tab="ALL_NEWS" label="Notícies" icon={Newspaper} />
                        <MobileNavItem tab="REWARDS" label="Premis" icon={Gift} />
                        <MobileNavItem tab="SUGGESTIONS" label="Bústia" icon={MessageSquare} />
                        <MobileNavItem tab="LEADERBOARD" label="Rànquing" icon={Crown} />
                    </>
                )}
            </nav>
        </main>
    </div>
  );
};

export default App;