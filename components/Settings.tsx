
import React from 'react';
import { ConversionOptions, BITRATE_OPTIONS, SAMPLE_RATE_OPTIONS } from '../types';

interface SettingsProps {
  options: ConversionOptions;
  setOptions: (options: ConversionOptions) => void;
}

export const Settings: React.FC<SettingsProps> = ({ options, setOptions }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        </div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
          Control Center
        </h3>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Output Bitrate
            </label>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">{options.bitrate}</span>
          </div>
          <div className="flex flex-col space-y-2">
            {BITRATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOptions({ ...options, bitrate: opt.value })}
                className={`
                  text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border-2
                  ${options.bitrate === opt.value 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100 hover:text-indigo-400'
                  }
                `}
              >
                <span>{opt.label.split('(')[0]}</span>
                <span className="opacity-60 text-[10px]">{opt.label.includes('(') ? opt.label.match(/\(([^)]+)\)/)?.[1] : ''}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Frequency
            </label>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">{parseInt(options.sampleRate)/1000}kHz</span>
          </div>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
            {SAMPLE_RATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOptions({ ...options, sampleRate: opt.value })}
                className={`
                  px-3 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all
                  ${options.sampleRate === opt.value 
                    ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' 
                    : 'text-slate-400 hover:text-slate-600'
                  }
                `}
              >
                {opt.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="bg-indigo-50/50 p-4 rounded-2xl">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center">
              <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Smart Tip
            </h4>
            <p className="text-[11px] leading-relaxed text-indigo-700/70 font-medium italic">
              "192 kbps" is the sweet spot for iPhone recordings. High quality, efficient file size.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
