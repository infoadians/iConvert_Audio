
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-indigo-100 group cursor-pointer active:scale-95 transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-white group-hover:rotate-12 transition-transform">
              <path d="M12 1v22M5 8v8M19 8v8M8 12v0M16 12v0M2 10v4M22 10v4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none tracking-tighter">iConvert</h1>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Studio</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audio Pro</span>
            </div>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Encrypted Sandbox</span>
          </div>
        </div>
      </div>
    </header>
  );
};
