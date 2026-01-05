
import React from 'react';
import { ConversionOptions, BITRATE_OPTIONS, SAMPLE_RATE_OPTIONS } from '../types';

interface SettingsProps {
  options: ConversionOptions;
  setOptions: (options: ConversionOptions) => void;
  t: any;
}

export const Settings: React.FC<SettingsProps> = ({ options, setOptions, t }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <svg width="18" height="18" className="text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.controlCenter}</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
            {t.bitrate}
          </label>
          <div className="grid grid-cols-1 gap-2">
            {BITRATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOptions({ ...options, bitrate: opt.value })}
                className={`
                  w-full text-left px-3 py-2.5 rounded-md text-sm transition-all border
                  ${options.bitrate === opt.value 
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-medium' 
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
            {t.frequency}
          </label>
          <div className="flex gap-2">
            {SAMPLE_RATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOptions({ ...options, sampleRate: opt.value })}
                className={`
                  flex-1 px-3 py-2 rounded-md text-sm transition-all border
                  ${options.sampleRate === opt.value 
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-medium' 
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }
                `}
              >
                {opt.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
