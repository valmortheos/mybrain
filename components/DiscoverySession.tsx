import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';

interface DiscoverySessionProps {
  lastAiMessage: Message | undefined;
  onSendAnswer: (text: string) => void;
  onTriggerStart: () => void;
  isLoading: boolean;
}

const DiscoverySession: React.FC<DiscoverySessionProps> = ({ lastAiMessage, onSendAnswer, onTriggerStart, isLoading }) => {
  const [answer, setAnswer] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto focus input when not loading
  useEffect(() => {
    if (!isLoading && hasStarted) {
      textareaRef.current?.focus();
    }
  }, [isLoading, hasStarted]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [answer]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!answer.trim() || isLoading) return;
    onSendAnswer(answer);
    setAnswer('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter for new line, Ctrl+Enter for submit
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStart = () => {
    setHasStarted(true);
    onTriggerStart();
  };

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 pt-20"> {/* Added padding top */}
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Mode Eksplorasi Aktif</h2>
        <p className="text-slate-500 text-sm mb-8 max-w-xs leading-relaxed">
          Biarkan AI mengambil alih kendali. Sistem akan mengajukan pertanyaan tajam untuk menggali lapisan kognitif terdalam Anda.
        </p>
        <button
          onClick={handleStart}
          className="px-8 py-4 bg-slate-800 text-white rounded-full font-bold shadow-lg shadow-slate-300 hover:scale-105 active:scale-95 transition-all text-sm"
        >
          MULAI SESI
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Question Card area - Adjusted spacing */}
      <div className="flex-1 flex flex-col justify-start items-center p-6 z-10 overflow-y-auto pt-24"> 
        
        {isLoading ? (
          <div className="text-center animate-in fade-in duration-700 mt-10">
             <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-6"></div>
             <p className="text-slate-600 font-medium tracking-wide text-sm animate-pulse">MEMFORMULASI PERTANYAAN...</p>
          </div>
        ) : (
            <div className="w-full max-w-lg animate-in slide-in-from-bottom-10 duration-500 mt-4">
                <div className="text-center mb-6">
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-slate-300">
                        Pertanyaan AI
                    </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 text-center leading-tight mb-8">
                  "{lastAiMessage?.content || "Sistem siap. Menunggu inisialisasi..."}"
                </h3>
            </div>
        )}

      </div>

      {/* Answer Area */}
      <div className="p-6 pb-28 w-full max-w-2xl mx-auto z-20">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Jawab sejujur mungkin... (Ctrl+Enter untuk kirim)"
            rows={2} 
            className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-5 text-lg text-slate-800 placeholder-slate-300 focus:border-slate-500 focus:ring-0 shadow-lg shadow-slate-200/50 transition-all text-center resize-none overflow-y-auto"
            disabled={isLoading}
          />
          <div className="absolute right-4 bottom-4">
             {answer.trim() && !isLoading && (
                 <button type="submit" className="p-2 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                 </button>
             )}
          </div>
        </form>
        <p className="text-center text-xs text-slate-400 mt-4 font-medium">
             Tekan tombol kirim atau Ctrl+Enter (PC)
        </p>
      </div>
    </div>
  );
};

export default DiscoverySession;