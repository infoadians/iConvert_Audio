
import React from 'react';
import { ConversionOptions, BITRATE_OPTIONS, SAMPLE_RATE_OPTIONS } from '../types';

interface SettingsProps {
  options: ConversionOptions;
  setOptions: (options: ConversionOptions) => void;
  t: any;
}

export const Settings: React.FC<SettingsProps> = ({ options, setOptions, t }) => {
  return (
    <div className="space-y-4">
      {/* Bitrate Selector - Simplified to minimal pill look */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest shrink-0 w-24">
          {t.bitrate}
        </label>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BITRATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOptions({ ...options, bitrate: opt.value })}
              className={`
                px-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all
                ${options.bitrate === opt.value 
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white' 
                  : 'bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }
              `}
            >
              {opt.label.split(' ')[0]} <span className="opacity-50 text-[9px]">{opt.label.includes('Standard') ? 'STD' : opt.label.includes('High') ? 'HQ' : ''}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sample Rate Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest shrink-0 w-24">
          {t.frequency}
        </label>
        <div className="flex-1 grid grid-cols-2 gap-2">
          {SAMPLE_RATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOptions({ ...options, sampleRate: opt.value })}
              className={`
                px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all
                ${options.sampleRate === opt.value 
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white' 
                  : 'bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
