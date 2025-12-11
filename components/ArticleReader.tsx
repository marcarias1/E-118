import React, { useState, useEffect, useRef } from 'react';
import { NewsArticle } from '../types';
import { ArrowLeft, Smile, Frown, Sparkles, Clock, AlertCircle, AlertTriangle, Star } from 'lucide-react';
import { summarizeArticle } from '../services/geminiService';

interface ArticleReaderProps {
  article: NewsArticle;
  onBack: () => void;
  onVote: (articleId: string, points: number) => void;
  alreadyVoted: boolean;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ article, onBack, onVote, alreadyVoted }) => {
  const [canVote, setCanVote] = useState(alreadyVoted);
  const [timeLeft, setTimeLeft] = useState(5); // 5 seconds minimum reading time
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // Logic: Calculate Points based on Importance and 7-day rule
  const publishDate = new Date(article.date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - publishDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const isLate = diffDays > 7;

  let basePoints = 10;
  if (article.importance === 'HIGH') basePoints = 20;
  if (article.importance === 'MEDIUM') basePoints = 15;

  const potentialPoints = isLate ? 1 : basePoints;

  // Logic: Scroll Detection
  const handleScroll = () => {
    if (contentRef.current && !canVote && !alreadyVoted) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isBottom = scrollHeight - scrollTop <= clientHeight + 50;
      
      if (isBottom && timeLeft === 0) {
        setCanVote(true);
      }
    }
  };

  // Logic: Timer
  useEffect(() => {
    if (timeLeft > 0 && !alreadyVoted) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
        if (contentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                setCanVote(true);
            }
        }
    }
  }, [timeLeft, alreadyVoted]);

  const handleSummarize = async () => {
    setLoadingSummary(true);
    const result = await summarizeArticle(article.content);
    setSummary(result);
    setLoadingSummary(false);
  };

  const getImportanceBadge = () => {
    switch(article.importance) {
      case 'HIGH': 
        return <span className="flex items-center gap-1 bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-bold uppercase"><AlertCircle size={12}/> Molt Important</span>;
      case 'MEDIUM':
        return <span className="flex items-center gap-1 bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded font-bold uppercase"><AlertTriangle size={12}/> Moderat</span>;
      default:
        return null; // Normal uses default styles
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in max-w-5xl mx-auto w-full shadow-sm rounded-none md:rounded-2xl overflow-hidden my-0 md:my-4">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-4 bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-full text-delagray-text">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-lg truncate text-delagray-title">
          {isLate ? 'Notícia Antiga' : 'Notícia Recent'}
        </h2>
        <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isLate ? 'bg-orange-100 text-orange-700' : 'bg-delagreen-light text-delagreen'}`}>
             <Star size={12} className="fill-current" />
             {isLate ? '1 pt' : `${potentialPoints} pts`}
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        ref={contentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-5 md:p-10 scroll-smooth"
      >
        <img src={article.imageUrl} alt={article.title} className="w-full h-48 md:h-80 object-cover rounded-xl mb-6 shadow-sm" />
        
        <div className="flex justify-between items-center mb-4">
            <span className="text-delagreen font-bold text-sm tracking-widest uppercase block">
                {publishDate.toLocaleDateString()}
            </span>
            <div className="flex gap-2">
                {getImportanceBadge()}
                {article.sector !== 'ALL' && (
                    <span className="bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded">
                        Sector: {article.sector}
                    </span>
                )}
            </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-6 leading-tight">{article.title}</h1>

        {/* AI Feature */}
        <div className="mb-8">
            {!summary ? (
                <button 
                    onClick={handleSummarize}
                    disabled={loadingSummary}
                    className="flex items-center gap-2 text-sm text-delagreen bg-delagreen-light px-4 py-2 rounded-full font-medium hover:bg-delagreen hover:text-white transition-colors"
                >
                    <Sparkles size={16} /> 
                    {loadingSummary ? 'Generant resum...' : 'Resumir amb IA'}
                </button>
            ) : (
                <div className="bg-delagreen-light p-6 rounded-xl border border-delagreen/20">
                    <div className="flex items-center gap-2 mb-2 text-delagreen-dark font-bold text-sm">
                        <Sparkles size={16} /> Resum IA
                    </div>
                    <p className="text-delagreen-dark italic leading-relaxed">{summary}</p>
                </div>
            )}
        </div>

        <div 
            className="prose prose-lg text-delagray-text max-w-none pb-20"
            dangerouslySetInnerHTML={{ __html: article.content }} 
        />

        <div className="h-20 flex items-center justify-center text-neutral-400 text-sm border-t border-dashed border-neutral-200 mt-10">
            --- Fi de la notícia ---
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="p-4 bg-white border-t border-neutral-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {alreadyVoted ? (
            <div className="bg-neutral-100 text-neutral-600 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                <Smile /> Notícia llegida
            </div>
        ) : (
            <div className="flex flex-col gap-3 max-w-2xl mx-auto">
                {!canVote && (
                    <div className="text-center text-xs text-neutral-500 flex items-center justify-center gap-1">
                       <Clock size={12}/> 
                       {timeLeft > 0 ? `Lectura mínima: ${timeLeft}s` : 'Llegeix fins al final per votar'}
                    </div>
                )}
                
                {canVote && isLate && (
                     <div className="text-center text-xs text-orange-600 flex items-center justify-center gap-1">
                        <AlertCircle size={12}/> 
                        Notícia antiga (més de 7 dies). Guanyaràs 1 punt.
                     </div>
                )}

                <div className="flex gap-4">
                    <button 
                        disabled={!canVote}
                        onClick={() => onVote(article.id, potentialPoints)}
                        className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors ${
                            canVote 
                            ? 'bg-delagreen text-white hover:bg-delagreen-dark shadow-md' 
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        }`}
                    >
                        <Smile size={24} /> 
                        {canVote ? `Interessant (+${potentialPoints})` : 'Interessant'}
                    </button>
                    <button 
                        disabled={!canVote}
                        onClick={() => onVote(article.id, potentialPoints)}
                        className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors ${
                            canVote 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                            : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                        }`}
                    >
                        <Frown size={24} /> 
                         {canVote ? `Avorrit (+${potentialPoints})` : 'Avorrit'}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};