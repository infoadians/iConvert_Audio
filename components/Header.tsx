
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-white">
              <path d="M12 1v22M5 8v8M19 8v8M8 12v0M16 12v0M2 10v4M22 10v4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">iConvert</h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Audio Lab</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center space-x-1 text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
          Privacy Shield: Files never leave your browser
        </div>
      </div>
    </header>
  );
};
