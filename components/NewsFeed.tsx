import React from 'react';
import { NewsArticle, Employee } from '../types';
import { CheckCircle, Clock, TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react';

interface NewsFeedProps {
  news: NewsArticle[];
  employee: Employee;
  filter: 'ALL' | 'SECTOR';
  onSelectArticle: (id: string) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ news, employee, filter, onSelectArticle }) => {
  
  const filteredNews = news.filter(item => {
      if (filter === 'ALL') return true;
      return item.sector === employee.sector || item.sector === 'ALL';
  });

  const sortedNews = [...filteredNews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getPointsBadge = (importance: string, isLate: boolean) => {
      if (isLate) return <span className="text-xs font-bold px-2 py-1 rounded-full bg-neutral-100 text-neutral-500">1 Pt</span>;
      switch(importance) {
          case 'HIGH': return <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-600">20 Pts</span>;
          case 'MEDIUM': return <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-600">15 Pts</span>;
          default: return <span className="text-xs font-bold px-2 py-1 rounded-full bg-delagreen-light text-delagreen">10 Pts</span>;
      }
  };

  return (
    <div className="flex flex-col h-full bg-delagray-bg animate-fade-in">
      {/* News List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 pb-24">
        
        {sortedNews.length === 0 ? (
            <div className="text-center py-20 text-neutral-400">
                <p>No hi ha notícies disponibles en aquesta secció.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedNews.map(item => {
                    const isRead = item.readBy.includes(employee.id);
                    
                    // Check date for points display
                    const publishDate = new Date(item.date);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - publishDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    const isLate = diffDays > 7;

                    return (
                        <div 
                            key={item.id}
                            onClick={() => onSelectArticle(item.id)}
                            className="bg-white rounded-2xl p-0 shadow-sm border border-neutral-100 flex flex-col cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group h-full"
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-neutral-800">
                                    {item.sector === 'ALL' ? 'General' : item.sector}
                                </div>
                                {isRead && (
                                    <div className="absolute top-3 right-3 bg-delagreen text-white p-1 rounded-full shadow-lg">
                                        <CheckCircle size={16} />
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                                        <Clock size={12} /> {new Date(item.date).toLocaleDateString()}
                                    </span>
                                    {!isRead && getPointsBadge(item.importance, isLate)}
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                    {item.importance === 'HIGH' && <AlertCircle size={16} className="text-red-500" />}
                                    {item.importance === 'MEDIUM' && <AlertTriangle size={16} className="text-orange-500" />}
                                    <h3 className={`font-bold text-lg leading-tight line-clamp-2 ${isRead ? 'text-neutral-500' : 'text-delagray-title'}`}>
                                        {item.title}
                                    </h3>
                                </div>
                                
                                <p className="text-neutral-500 text-sm line-clamp-2 mb-4 flex-1">
                                    {item.summary}
                                </p>
                                
                                <div className="mt-auto pt-4 border-t border-neutral-50 flex items-center text-delagreen font-bold text-sm group-hover:gap-2 transition-all">
                                    Llegir notícia <TrendingUp size={16} className="ml-1" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
      </div>
    </div>
  );
};