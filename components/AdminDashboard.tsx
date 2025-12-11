import React, { useState } from 'react';
import { NewsArticle, Suggestion, SuggestionStatus, Sector, ImportanceLevel } from '../types';
import { BarChart3, MessageSquare, ThumbsUp, ThumbsDown, Eye, Clock, User, Check, X, Trash2, Plus, AlertCircle, Save } from 'lucide-react';

interface AdminDashboardProps {
  news: NewsArticle[];
  suggestions: Suggestion[];
  onUpdateStatus: (id: string, status: SuggestionStatus) => void;
  onDeleteSuggestion: (id: string) => void;
  onCreateArticle: (article: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ news, suggestions, onUpdateStatus, onDeleteSuggestion, onCreateArticle }) => {
  const [tab, setTab] = useState<'ANALYTICS' | 'INBOX' | 'CREATE'>('ANALYTICS');

  // Create Article State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSector, setNewSector] = useState<Sector | 'ALL'>('ALL');
  const [newImportance, setNewImportance] = useState<ImportanceLevel>('NORMAL');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1596450523824-343586d639b7?q=80&w=600');

  const handleCreateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onCreateArticle({
          title: newTitle,
          content: newContent,
          summary: newContent.substring(0, 100) + '...',
          sector: newSector,
          importance: newImportance,
          imageUrl: newImage
      });
      // Reset
      setNewTitle('');
      setNewContent('');
      setNewSector('ALL');
      setNewImportance('NORMAL');
      setTab('ANALYTICS');
  };

  const getStatusBadge = (status: SuggestionStatus) => {
      switch(status) {
          case 'ACCEPTED': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">ACCEPTADA</span>;
          case 'REJECTED': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">REBUTJADA</span>;
          case 'REVIEW': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-200">EN REVISIÓ</span>;
          default: return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-200">PENDENT</span>;
      }
  }

  return (
    <div className="flex flex-col h-full bg-delagray-bg p-6 animate-fade-in overflow-hidden">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-delagray-title">Panell d'Administració</h2>
            <div className="bg-white rounded-lg p-1 flex shadow-sm">
                <button 
                    onClick={() => setTab('ANALYTICS')}
                    className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${tab === 'ANALYTICS' ? 'bg-delagreen text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                >
                    Analítica
                </button>
                <button 
                    onClick={() => setTab('INBOX')}
                    className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${tab === 'INBOX' ? 'bg-delagreen text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                >
                    Bústia ({suggestions.length})
                </button>
                <button 
                    onClick={() => setTab('CREATE')}
                    className={`px-4 py-2 rounded-md font-bold text-sm transition-colors flex items-center gap-1 ${tab === 'CREATE' ? 'bg-delagreen text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                >
                    <Plus size={16} /> Crear Notícia
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-20">
            {tab === 'ANALYTICS' && (
                <div className="space-y-6">
                    {news.map(article => (
                        <div key={article.id} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-delagray-title flex items-center gap-2">
                                        {article.title}
                                    </h3>
                                    <span className="text-xs font-normal text-neutral-400">
                                        {new Date(article.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${article.importance === 'HIGH' ? 'bg-red-100 text-red-600' : article.importance === 'MEDIUM' ? 'bg-orange-100 text-orange-600' : 'bg-neutral-100 text-neutral-600'}`}>
                                    {article.importance}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-blue-400 uppercase">Vistes</p>
                                    <p className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                                        <Eye size={20} /> {article.stats?.views || 0}
                                    </p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-green-400 uppercase">M'agrada</p>
                                    <p className="text-2xl font-bold text-green-700 flex items-center gap-2">
                                        <ThumbsUp size={20} /> {article.stats?.likes || 0}
                                    </p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-red-400 uppercase">No M'agrada</p>
                                    <p className="text-2xl font-bold text-red-700 flex items-center gap-2">
                                        <ThumbsDown size={20} /> {article.stats?.dislikes || 0}
                                    </p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-orange-400 uppercase">Temps Mitjà</p>
                                    <p className="text-2xl font-bold text-orange-700 flex items-center gap-2">
                                        <Clock size={20} /> {article.stats?.avgTime || 0}s
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'INBOX' && (
                <div className="space-y-4">
                    {suggestions.length === 0 ? (
                        <div className="text-center py-20 text-neutral-400">
                            <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No hi ha suggeriments nous.</p>
                        </div>
                    ) : (
                        suggestions.map(s => (
                            <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.isAnonymous ? 'bg-neutral-100 text-neutral-500' : 'bg-delagreen-light text-delagreen'}`}>
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">
                                                {s.isAnonymous ? 'Anònim' : s.authorName}
                                            </p>
                                            <p className="text-xs text-neutral-400">
                                                {new Date(s.date).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(s.status)}
                                </div>
                                
                                <p className="text-delagray-text bg-neutral-50 p-4 rounded-xl border border-neutral-100 italic mb-4">
                                    "{s.text}"
                                </p>

                                {/* ACTION BAR */}
                                <div className="flex items-center justify-end gap-2 border-t pt-4 border-neutral-100">
                                    {s.status === 'PENDING' && (
                                        <button 
                                            onClick={() => onUpdateStatus(s.id, 'REVIEW')}
                                            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg font-bold flex items-center gap-1 transition-colors"
                                        >
                                            <Eye size={14} /> Posar en Revisió
                                        </button>
                                    )}

                                    {s.status === 'REVIEW' && (
                                        <>
                                            <button 
                                                onClick={() => onUpdateStatus(s.id, 'ACCEPTED')}
                                                className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded-lg font-bold flex items-center gap-1 transition-colors"
                                            >
                                                <Check size={14} /> Acceptar
                                            </button>
                                            <button 
                                                onClick={() => onUpdateStatus(s.id, 'REJECTED')}
                                                className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg font-bold flex items-center gap-1 transition-colors"
                                            >
                                                <X size={14} /> Rebutjar
                                            </button>
                                        </>
                                    )}

                                    {(s.status === 'ACCEPTED' || s.status === 'REJECTED') && (
                                        <button 
                                            onClick={() => onDeleteSuggestion(s.id)}
                                            className="text-xs text-neutral-400 hover:text-red-500 px-3 py-2 font-bold flex items-center gap-1 transition-colors ml-auto"
                                        >
                                            <Trash2 size={14} /> Eliminar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === 'CREATE' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Plus size={20} className="text-delagreen" /> Nova Notícia
                    </h3>
                    <form onSubmit={handleCreateSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-neutral-500 mb-2">Títol</label>
                            <input 
                                required
                                type="text" 
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                className="w-full p-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-delagreen outline-none bg-white text-gray-900 placeholder-gray-400"
                                placeholder="Ex: Nova normativa de seguretat"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-neutral-500 mb-2">Sector</label>
                                <select 
                                    value={newSector}
                                    onChange={e => setNewSector(e.target.value as any)}
                                    className="w-full p-3 border border-neutral-200 rounded-lg outline-none bg-white text-gray-900"
                                >
                                    <option value="ALL">Tots</option>
                                    <option value="PRODUCTION">Producció</option>
                                    <option value="OFFICE">Oficines</option>
                                    <option value="MARKETING">Màrqueting</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-neutral-500 mb-2">Importància</label>
                                <select 
                                    value={newImportance}
                                    onChange={e => setNewImportance(e.target.value as ImportanceLevel)}
                                    className="w-full p-3 border border-neutral-200 rounded-lg outline-none bg-white text-gray-900"
                                >
                                    <option value="NORMAL">Normal (10 pts)</option>
                                    <option value="MEDIUM">Moderat (15 pts)</option>
                                    <option value="HIGH">Molt Important (20 pts)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-neutral-500 mb-2">Contingut (HTML suportat)</label>
                            <textarea 
                                required
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                                className="w-full p-3 h-32 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-delagreen outline-none resize-none bg-white text-gray-900 placeholder-gray-400"
                                placeholder="Escriu el cos de la notícia..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-neutral-500 mb-2">URL Imatge</label>
                            <input 
                                type="text" 
                                value={newImage}
                                onChange={e => setNewImage(e.target.value)}
                                className="w-full p-3 border border-neutral-200 rounded-lg outline-none text-xs bg-white text-gray-500"
                            />
                        </div>

                        <button type="submit" className="w-full py-4 bg-delagreen text-white font-bold rounded-xl hover:bg-delagreen-dark flex items-center justify-center gap-2">
                            <Save size={20} /> Publicar Notícia
                        </button>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
};