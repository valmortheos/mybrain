import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { UserProfile, CognitiveMetrics } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  metrics: CognitiveMetrics;
  nodeCount: number;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, userProfile, metrics, nodeCount }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (cardRef.current === null) {
      return;
    }

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `mybrain-snapshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      // Optional: Close modal after download
      // onClose(); 
    } catch (err) {
      console.error('Gagal membuat snapshot:', err);
      alert('Gagal membuat gambar. Coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Hitung Dominan
  const dominantTrait = Object.entries(metrics).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-white">
          <h3 className="text-sm font-bold text-slate-800">Snapshot Kognitif</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex justify-center">
            {/* The Capture Target */}
            <div ref={cardRef} className="w-full bg-white text-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-100 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-200 rounded-full blur-3xl opacity-50"></div>

                {/* Branding */}
                <div className="flex justify-between items-start mb-6 border-b-2 border-slate-900 pb-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900">MYBRAIN</h1>
                        <p className="text-[10px] tracking-widest uppercase font-semibold text-slate-500">Cognitive Analysis System</p>
                    </div>
                    <div className="text-right">
                         <div className="text-[8px] font-bold bg-slate-900 text-white px-2 py-1 rounded inline-block">BY VALMORTHEOS</div>
                         <div className="text-[10px] mt-1 font-mono text-slate-400">{new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Main Profile */}
                <div className="mb-6">
                    <div className="text-4xl font-black text-slate-800 mb-1 break-words leading-none">
                        {userProfile.name || "ANONIM"}
                    </div>
                    <div className="flex gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                        <span>{userProfile.gender || "N/A"}</span> • <span>{userProfile.age ? `${userProfile.age} THN` : "N/A"}</span>
                        {userProfile.mbti && <span className="text-slate-900 bg-slate-200 px-1.5 rounded">{userProfile.mbti}</span>}
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {userProfile.personalityTraits.slice(0, 5).map((t, i) => (
                             <span key={i} className="px-2 py-1 border border-slate-300 rounded text-[9px] font-bold text-slate-600 uppercase">{t}</span>
                        ))}
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-[9px] uppercase font-bold text-slate-400 mb-1">Dominansi Otak</div>
                        <div className="text-lg font-black text-slate-800 capitalize">{dominantTrait}</div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-slate-800 h-full" style={{ width: `${metrics[dominantTrait as keyof CognitiveMetrics]}%` }}></div>
                        </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="text-[9px] uppercase font-bold text-slate-400 mb-1">Total Simpul</div>
                         <div className="text-lg font-black text-slate-800">{nodeCount}</div>
                         <div className="text-[9px] text-slate-500 leading-tight mt-1">Konsep yang terpetakan dalam jaringan saraf.</div>
                    </div>
                </div>

                 {/* Interests & Career */}
                 <div className="space-y-4">
                    {userProfile.careerAmbitions.length > 0 && (
                        <div>
                             <div className="text-[9px] uppercase font-bold text-slate-400 mb-1 border-b border-slate-100 pb-1">Arah Karir</div>
                             <p className="text-sm font-bold text-slate-800 leading-tight">{userProfile.careerAmbitions.join(", ")}</p>
                        </div>
                    )}
                    {userProfile.interests.length > 0 && (
                        <div>
                             <div className="text-[9px] uppercase font-bold text-slate-400 mb-1 border-b border-slate-100 pb-1">Minat Utama</div>
                             <p className="text-xs font-medium text-slate-600 leading-relaxed">{userProfile.interests.slice(0,6).join(", ")}</p>
                        </div>
                    )}
                 </div>

                 <div className="mt-8 pt-4 border-t-2 border-slate-900 flex justify-between items-end">
                    <div className="text-[8px] text-slate-400 max-w-[60%]">
                        Generated by AI based on real-time conversation analysis.
                    </div>
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                 </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button 
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
                <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Memproses Gambar...
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Simpan ke Galeri
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;