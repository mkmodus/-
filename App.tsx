import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { LanguageSelector } from './components/LanguageSelector';
import { Timeline } from './components/Timeline';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { processAudioChunk } from './services/geminiService';
import { Language, TranslationRecord } from './types';
import { Mic, Square, Download, Trash2, FileSpreadsheet, Maximize, Minimize, Timer, Loader2 } from 'lucide-react';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const App: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<Language>(Language.KOREAN);
  const [targetLang, setTargetLang] = useState<Language>(Language.ENGLISH);
  const [history, setHistory] = useState<TranslationRecord[]>([]);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const INTERVAL_MS = 15000;

  const handleChunkReady = useCallback(async (blob: Blob) => {
    const recordId = Date.now().toString();
    
    // Add temporary loading entry
    setHistory(prev => [
      ...prev,
      {
        id: recordId,
        timestamp: new Date(),
        sourceLang,
        targetLang,
        originalText: '',
        translatedText: '',
        isLoading: true
      }
    ]);

    try {
      const base64 = await blobToBase64(blob);
      const result = await processAudioChunk(base64, blob.type, sourceLang, targetLang);
      
      setHistory(prev => prev.map(item => 
        item.id === recordId 
          ? { ...item, originalText: result.original, translatedText: result.translated, isLoading: false }
          : item
      ));
    } catch (err) {
      console.error("Chunk processing failed", err);
      setHistory(prev => prev.map(item => 
        item.id === recordId 
          ? { ...item, isLoading: false, error: "Failed to process audio chunk." }
          : item
      ));
    }
  }, [sourceLang, targetLang]);

  const { isRecording, elapsedTime, startRecording, stopRecording } = useAudioRecorder({
    onChunkReady: handleChunkReady,
    intervalMs: INTERVAL_MS
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const exportToCSV = useCallback(() => {
    if (history.length === 0) return;

    const headers = ["Timestamp", "Source Language", "Target Language", "Original Text", "Translated Text"];
    const rows = history.map(record => [
      record.timestamp.toLocaleString(),
      record.sourceLang,
      record.targetLang,
      `"${(record.originalText || '').replace(/"/g, '""')}"`,
      `"${(record.translatedText || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    
    link.setAttribute("href", url);
    link.setAttribute("download", `interpretation_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  }, [history]);

  const clearHistory = () => {
    if (window.confirm("Clear current session history?")) {
      setHistory([]);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const progress = Math.min((elapsedTime / INTERVAL_MS) * 100, 100);

  return (
    <div className={`min-h-screen bg-white flex flex-col ${isFullscreen ? 'p-0' : ''}`}>
      <Header />

      <main className={`flex-1 max-w-3xl w-full mx-auto px-4 flex flex-col gap-8 relative ${isFullscreen ? 'py-4' : 'py-8'}`}>
        
        <section className={`space-y-6 transition-all ${isFullscreen && isRecording ? 'opacity-30' : 'opacity-100'}`}>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-3">
                {isFullscreen && (
                  <img 
                    src="https://platformc.kr/static/82af0600254ab27db6931a77139eeef8/f1831/logo_website_2023.webp" 
                    alt="PlatformC Logo" 
                    className="h-8 object-contain"
                  />
                )}
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Sequential Native Interpreter
                </h2>
              </div>
              <p className="text-gray-500 text-sm">
                Interpret every 15 seconds. High accuracy activist domain model.
              </p>
            </div>
            <button 
              onClick={toggleFullscreen}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-4"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>

          <LanguageSelector 
            sourceLang={sourceLang}
            targetLang={targetLang}
            setSourceLang={setSourceLang}
            setTargetLang={setTargetLang}
            disabled={isRecording}
          />
        </section>

        {history.length > 0 && !isRecording && (
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <FileSpreadsheet size={16} className="text-green-600" />
              <span>Session History ({history.length} blocks)</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Download size={14} />
                Export CSV
              </button>
              <button 
                onClick={clearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors shadow-sm"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
          </div>
        )}

        <section className="flex-1">
          <Timeline history={history} />
        </section>
      </main>

      {showSaveToast && (
        <div className="fixed top-20 right-4 z-[60] bg-green-600 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full">
          <FileSpreadsheet size={20} />
          <div>
            <p className="font-bold text-sm">Session Saved</p>
            <p className="text-xs opacity-90">Spreadsheet has been downloaded.</p>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pt-12 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-center relative">
          
          {isRecording && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-mono shadow-xl animate-in fade-in slide-in-from-bottom-2">
              <Timer size={14} className="animate-pulse" />
              <span>Next Refresh: {Math.max(0, Math.ceil((INTERVAL_MS - elapsedTime)/1000))}s</span>
            </div>
          )}

          <button
            onClick={handleToggleRecording}
            className={`
              relative flex items-center justify-center w-20 h-20 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {isRecording && (
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-white/20"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="46"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-white transition-all duration-100 ease-linear"
                  strokeWidth="4"
                  strokeDasharray={289.027}
                  strokeDashoffset={289.027 - (289.027 * progress) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="46"
                  cx="50"
                  cy="50"
                />
              </svg>
            )}
            {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={32} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;