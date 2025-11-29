import React from 'react';
import { PenTool, Image as ImageIcon, Lightbulb, Settings, User, Crown, Zap, Lock } from 'lucide-react';
import { MainTab } from '../types';

interface NavigationProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenApiKeySettings: () => void;
  userAvatar: string | null;
  onOpenProUpgrade: () => void;
  isPro: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  onOpenApiKeySettings,
  userAvatar,
  onOpenProUpgrade,
  isPro
}) => {
  const navItems = [
    { id: 'create_prompt' as MainTab, icon: PenTool, label: 'Tạo Prompt' },
    { id: 'create_image' as MainTab, icon: ImageIcon, label: 'Tạo Hình ảnh' },
    { id: 'learn_ideas' as MainTab, icon: Lightbulb, label: 'Học Ý tưởng' },
  ];

  return (
    <div className="w-20 lg:w-72 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 text-white flex flex-col h-full flex-shrink-0 z-30">
      {/* Header / Logo */}
      <div className="h-24 flex items-center justify-center lg:justify-start px-0 lg:px-6 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center flex-shrink-0 transform rotate-3">
          <span className="font-extrabold text-xl text-white">SP</span>
        </div>
        <div className="ml-4 hidden lg:block">
           <h1 className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Siêu Prompt</h1>
           <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Education AI</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 px-3 lg:px-6 space-y-3">
        {navItems.map((item) => {
          const isLocked = !isPro && (item.id === 'create_image' || item.id === 'learn_ideas');
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => isLocked ? onOpenProUpgrade() : onTabChange(item.id)}
              className={`
                w-full flex items-center justify-between lg:justify-start p-4 rounded-2xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}
                ${isLocked ? 'opacity-60 grayscale' : ''}
              `}
              title={isLocked ? "Nâng cấp PRO để mở khóa" : item.label}
            >
              <div className="flex items-center w-full justify-center lg:justify-start">
                 <item.icon size={24} className={`flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                 <span className={`ml-4 font-bold text-lg hidden lg:block`}>{item.label}</span>
              </div>
              {isLocked && <Lock size={16} className="hidden lg:block ml-auto text-slate-600" />}
            </button>
          );
        })}
      </div>

      {/* Footer Nav */}
      <div className="p-3 lg:p-6 space-y-3 mt-auto">
        
        {/* PRO Upgrade Button */}
        <button
          onClick={onOpenProUpgrade}
          className={`
            w-full flex items-center justify-center lg:justify-start p-4 rounded-2xl transition-all duration-300 mb-4 group relative overflow-hidden border
            ${isPro 
              ? 'bg-slate-800/50 border-amber-500/30 text-amber-400' 
              : 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400/50 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02]'}
          `}
        >
          {/* Shine effect for non-pro */}
          {!isPro && <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12 blur-md"></div>}
          
          {isPro ? <Crown size={24} className="flex-shrink-0 fill-amber-400" /> : <Zap size={24} className="flex-shrink-0 fill-white" />}
          <div className="ml-3 hidden lg:block relative z-10">
             <span className={`font-bold text-lg block ${isPro ? 'text-amber-400' : 'text-white'}`}>
                {isPro ? 'PRO Member' : 'Nâng cấp PRO'}
             </span>
          </div>
        </button>

        <div className="bg-slate-800/50 rounded-2xl p-2 border border-white/5">
            <button
            onClick={onOpenApiKeySettings}
            className="w-full flex items-center justify-center lg:justify-start p-3 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-colors mb-1"
            title="Cấu hình API Key"
            >
            <Settings size={20} className="flex-shrink-0" />
            <span className="ml-3 font-medium hidden lg:block">Cài đặt API</span>
            </button>

            <button
            onClick={() => onTabChange('profile')}
            className={`
                w-full flex items-center justify-center lg:justify-start p-2 rounded-xl transition-colors
                ${activeTab === 'profile' ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-slate-400 hover:text-white'}
            `}
            title="Hồ sơ cá nhân"
            >
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-600 flex-shrink-0 shadow-lg">
                {userAvatar ? (
                <img src={userAvatar} alt="Me" className="w-full h-full object-cover" />
                ) : (
                <User size={20} />
                )}
            </div>
            <div className="ml-3 text-left hidden lg:block overflow-hidden">
                <p className="text-sm font-bold truncate">Tài khoản</p>
                <p className="text-xs opacity-70">Cài đặt cá nhân</p>
            </div>
            </button>
        </div>
      </div>
    </div>
  );
};