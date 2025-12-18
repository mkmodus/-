import React, { useEffect, useRef } from 'react';
import { TranslationRecord } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

interface TimelineProps {
  history: TranslationRecord[];
}

export const Timeline: React.FC<TimelineProps> = ({ history }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-lg font-medium">Ready to interpret</p>
        <p className="text-sm">Press start and speak clearly for 15-second blocks.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {history.map((record) => (
        <div key={record.id} className="group relative pl-0 sm:pl-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
           {/* Card */}
          <div className={`
            p-5 rounded-2xl border shadow-sm transition-all
            ${record.isLoading ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100 hover:shadow-md'}
            ${record.error ? 'bg-red-50 border-red-100' : ''}
          `}>
            {/* Header info */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-600">
                  {record.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                {record.isLoading && (
                  <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing audio...
                  </span>
                )}
                {record.error && (
                  <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    Error
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="grid gap-4">
              {/* Original */}
              <div className="relative">
                <p className="text-xs text-gray-400 mb-1 font-semibold uppercase">{record.sourceLang}</p>
                <div className={`text-base sm:text-lg text-gray-800 leading-relaxed ${record.isLoading ? 'animate-pulse' : ''}`}>
                   {record.isLoading ? (
                     <div className="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
                   ) : (
                     record.originalText || <span className="text-gray-300 italic">No audible speech detected</span>
                   )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 w-full" />

              {/* Translation */}
              <div className="relative">
                <p className="text-xs text-blue-400 mb-1 font-semibold uppercase">{record.targetLang}</p>
                <div className={`text-base sm:text-lg text-gray-900 font-medium leading-relaxed ${record.isLoading ? 'animate-pulse' : ''}`}>
                  {record.isLoading ? (
                    <div className="h-6 bg-blue-50 rounded w-1/2"></div>
                  ) : (
                    record.translatedText || (record.originalText ? <span className="text-gray-300 italic">Translation empty</span> : <span className="text-gray-300 italic">-</span>)
                  )}
                </div>
              </div>
            </div>
            
            {record.error && (
               <div className="mt-3 text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">
                 {record.error}
               </div>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};