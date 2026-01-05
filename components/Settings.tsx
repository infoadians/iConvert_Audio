
import React from 'react';
import { ConversionOptions, BITRATE_OPTIONS, SAMPLE_RATE_OPTIONS } from '../types';

interface SettingsProps {
  options: ConversionOptions;
  setOptions: (options: ConversionOptions) => void;
  t: any;
}

export const Settings: React.FC<SettingsProps> = ({ options, setOptions, t }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm lg:sticky lg:top-24 transition-colors duration-300">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-700 dark:text-zinc-200">
          {t.controlCenter}
        </h3>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              {t.bitrate}
            </label>
            <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full">{options.bitrate}</span>
          </div>
          <div className="flex flex-col space-y-2">
            {BITRATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOptions({ ...options, bitrate: opt.value })}
                className={`
                  text-left px-4 py-3 rounded-2xl text-[10px] font-bold transition-all flex items-center justify-between border-2
                  ${options.bitrate === opt.value 
                    ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white shadow-lg shadow-indigo-100 dark:shadow-none' 
                    : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-indigo-100 dark:hover:border-zinc-700'
                  }
                `}
              >
                <span className="uppercase tracking-widest">{opt.label.split('(')[0].trim()}</span>
                <span className="opacity-60 text-[8px] font-black tracking-tighter">{opt.label.includes('(') ? opt.label.match(/\(([^)]+)\)/)?.[1].toUpperCase() : ''}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              {t.frequency}
            </label>
            <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 rounded-full tracking-widest">{parseInt(options.sampleRate)/1000}KHZ</span>
          </div>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800">
            {SAMPLE_RATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOptions({ ...options, sampleRate: opt.value })}
                className={`
                  px-3 py-2.5 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all
                  ${options.sampleRate === opt.value 
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/50' 
                    : 'text-slate-400 dark:text-zinc-600 hover:text-slate-600'
                  }
                `}
              >
                {opt.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50 dark:border-zinc-800">
          <div className="bg-indigo-50/30 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20">
            <h4 className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center">
              <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {t.smartTip}
            </h4>
            <p className="text-[11px] leading-relaxed text-indigo-700/70 dark:text-indigo-300/60 font-medium italic">
              {t.tipText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
