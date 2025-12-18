import React from 'react';
import { Language } from '../types';
import { ArrowRightLeft } from 'lucide-react';

interface LanguageSelectorProps {
  sourceLang: Language;
  targetLang: Language;
  setSourceLang: (lang: Language) => void;
  setTargetLang: (lang: Language) => void;
  disabled: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLang,
  targetLang,
  setSourceLang,
  setTargetLang,
  disabled
}) => {
  const languages = Object.values(Language);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
      <div className="flex flex-col gap-1 w-full sm:w-auto">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Source (Speaker)</label>
        <div className="relative">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value as Language)}
            disabled={disabled}
            className="w-full sm:w-48 appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 disabled:opacity-50 transition-colors"
          >
            {languages.map((lang) => (
              <option key={`source-${lang}`} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      <div className="mt-5 text-gray-400">
        <ArrowRightLeft size={20} />
      </div>

      <div className="flex flex-col gap-1 w-full sm:w-auto">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Target (Listener)</label>
        <div className="relative">
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as Language)}
            disabled={disabled}
            className="w-full sm:w-48 appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 disabled:opacity-50 transition-colors"
          >
            {languages.map((lang) => (
              <option key={`target-${lang}`} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
};
