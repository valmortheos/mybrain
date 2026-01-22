import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea logic
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      // Set height based on scrollHeight, max 150px
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    // Height will reset via useEffect
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Desktop Convention: Ctrl + Enter to submit, Enter for new line
    // Mobile: User typically uses the Send button, Enter creates new line automatically
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 scroll-smooth"> 
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 animate-pulse">
                <p className="text-sm font-medium">Menunggu Inisialisasi Kognitif...</p>
            </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm transition-all whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-slate-800 text-white rounded-br-none shadow-slate-300'
                  : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none text-xs text-slate-500 flex items-center gap-2 shadow-sm">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              </span>
              <span className="tracking-wide font-medium">Menganalisis struktur pikiran...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area - Polished Focus States */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-20">
        <form onSubmit={handleSubmit} className="relative flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tuliskan pikiran Anda... (Ctrl+Enter untuk kirim)"
            rows={2} 
            className="flex-1 pl-5 pr-4 py-3 bg-slate-100 border border-transparent rounded-2xl text-slate-800 placeholder-slate-400 
                       focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 
                       transition-all duration-200 text-sm shadow-inner resize-none overflow-y-auto min-h-[50px] max-h-[150px]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-[50px] w-[50px] flex items-center justify-center bg-slate-800 text-white rounded-xl hover:bg-slate-700 hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:scale-100 disabled:cursor-not-allowed
                       transition-all duration-200 shadow-lg shadow-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;