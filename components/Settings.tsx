
import React from 'react';
import { ConversionOptions, BITRATE_OPTIONS, SAMPLE_RATE_OPTIONS } from '../types';

interface SettingsProps {
  options: ConversionOptions;
  setOptions: (options: ConversionOptions) => void;
  t: any;
}

export const Settings: React.FC<SettingsProps> = ({ options, setOptions, t }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-8 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-slate-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">{t.controlCenter}</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-3 block">{t.bitrate}</label>
          <div className="grid grid-cols-1 gap-2">
            {BITRATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOptions({ ...options, bitrate: opt.value })}
                className={`text-left px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${options.bitrate === opt.value ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-slate-100 dark:border-zinc-800 text-slate-400 hover:border-indigo-200'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-3 block">{t.frequency}</label>
          <div className="flex gap-2">
            {SAMPLE_RATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOptions({ ...options, sampleRate: opt.value })}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${options.sampleRate === opt.value ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-slate-100 dark:border-zinc-800 text-slate-400 hover:border-indigo-200'}`}
              >
                {opt.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h4 className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{t.smartTip}</h4>
          </div>
          <p className="text-[10px] leading-relaxed text-indigo-700/70 dark:text-indigo-300/60 font-medium italic">{t.tipText}</p>
        </div>
      </div>
    </div>
  );
};
