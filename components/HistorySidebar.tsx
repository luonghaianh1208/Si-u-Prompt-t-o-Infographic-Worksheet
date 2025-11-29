import React from 'react';
import { Search, FileText, Trash2, Clock, X } from 'lucide-react';
import { SavedPrompt } from '../types';

interface HistorySidebarProps {
  prompts: SavedPrompt[];
  currentPromptId: string | null;
  onSelectPrompt: (prompt: SavedPrompt) => void;
  onNewPrompt: () => void;
  onDeletePrompt: (e: React.MouseEvent, id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  prompts,
  currentPromptId,
  onSelectPrompt,
  onNewPrompt,
  onDeletePrompt,
  searchTerm,
  onSearchChange,
  isOpen,
  onClose
}) => {
  const filteredPrompts = prompts
    .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div 
      className={`
        fixed inset-y-0 right-0 z-40 w-80 bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:relative lg:translate-x-0 lg:w-80 flex-shrink-0
      `}
    >
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-900">
        <h3 className="font-bold text-white text-lg tracking-wide">Lịch sử Prompt</h3>
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 py-4 bg-slate-900/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">Chưa có dữ liệu.</p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              onClick={() => onSelectPrompt(prompt)}
              className={`
                group flex items-start p-3.5 rounded-xl cursor-pointer transition-all border
                ${currentPromptId === prompt.id 
                  ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'}
              `}
            >
              <FileText 
                size={18} 
                className={`mt-0.5 flex-shrink-0 ${currentPromptId === prompt.id ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'}`} 
              />
              <div className="ml-3 flex-1 min-w-0">
                <h4 className={`text-sm font-bold truncate ${currentPromptId === prompt.id ? 'text-cyan-100' : 'text-slate-300 group-hover:text-white'}`}>
                  {prompt.title || "Chưa đặt tên"}
                </h4>
                <div className="flex items-center mt-1.5 text-xs text-slate-500 group-hover:text-slate-400">
                  <Clock size={10} className="mr-1" />
                  {new Date(prompt.updatedAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <button
                onClick={(e) => onDeletePrompt(e, prompt.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Xóa"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Footer / Create New Button Shortcut */}
      <div className="p-5 border-t border-white/5 bg-slate-900/50">
         <button
          onClick={onNewPrompt}
          className="w-full py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-cyan-400 font-bold rounded-xl hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all text-sm uppercase tracking-wider"
        >
          + Tạo Prompt Mới
        </button>
      </div>
    </div>
  );
};