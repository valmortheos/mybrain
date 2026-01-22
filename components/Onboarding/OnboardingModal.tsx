import React, { useState, useEffect } from 'react';
import { triggerHaptic } from '../../services/device/haptics';

interface OnboardingModalProps {
  onComplete: () => void;
  isVisible: boolean;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, isVisible }) => {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const [isEnvKeyDetected, setIsEnvKeyDetected] = useState(false);

  useEffect(() => {
    // Deteksi jika API KEY sudah ada di Environment
    if (process.env.API_KEY) {
      setIsEnvKeyDetected(true);
      setApiKey(process.env.API_KEY);
    } else {
        const stored = localStorage.getItem('mybrain_api_key');
        if (stored) setApiKey(stored);
    }
  }, []);

  const handleNext = () => {
    triggerHaptic('light');
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    triggerHaptic('light');
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    triggerHaptic('success');
    // Simpan API Key jika user input manual dan bukan dari Env
    if (!isEnvKeyDetected && apiKey.trim()) {
      localStorage.setItem('mybrain_api_key', apiKey.trim());
    }

    setIsExiting(true);
    // Tunggu animasi slide-up selesai baru unmount/callback
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  if (!isVisible) return null;

  return (
    <div 
        className={`fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isExiting ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="w-full max-w-md h-full flex flex-col justify-between relative overflow-hidden">
        
        {/* Header / Progress */}
        <div className="px-6 pt-8 pb-4 z-10 bg-slate-50">
            <div className="flex gap-2">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${i <= step ? 'bg-slate-800' : 'bg-slate-200'}`} />
                ))}
            </div>
        </div>

        {/* Carousel Content Container */}
        {/* FIX LOGIC: Gunakan flex container normal dengan lebar 100% per slide, geser parentnya */}
        <div className="flex-1 relative w-full overflow-hidden">
            <div 
                className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.25, 1, 0.5, 1)]"
                style={{ transform: `translateX(-${step * 100}%)` }}
            >
                {/* SLIDE 1: INTRO */}
                <div className="min-w-full w-full h-full flex flex-col justify-center p-6 shrink-0">
                    <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-slate-300">
                         <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight leading-tight">
                        Selamat Datang di <br/><span className="text-indigo-600">MyBrain.</span>
                    </h1>
                    <p className="text-lg text-slate-500 leading-relaxed font-medium">
                        Bukan sekadar chatbot. Ini adalah cermin digital kognisi Anda. Sistem yang memetakan pikiran, kenangan, dan emosi menjadi jaringan visual yang hidup.
                    </p>
                </div>

                {/* SLIDE 2: FEATURES */}
                <div className="min-w-full w-full h-full flex flex-col justify-center p-6 shrink-0">
                    <h2 className="text-3xl font-bold text-slate-800 mb-8">Bagaimana Cara Kerjanya?</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m0 0l-2.25-1.313M3 14.25v2.25l2.25 1.313m0 0l2.25-1.313" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Visualisasi Neural</h3>
                                <p className="text-xs text-slate-500 mt-1">Setiap topik yang Anda bahas menjadi 'Simpul' yang saling terhubung.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0 text-rose-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Powered by Gemini AI</h3>
                                <p className="text-xs text-slate-500 mt-1">Kecerdasan buatan Google menganalisis pola pikir secara real-time.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Profil Dinamis</h3>
                                <p className="text-xs text-slate-500 mt-1">Sistem membangun profil psikologis yang berubah seiring waktu.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SLIDE 3: API KEY SETUP */}
                <div className="min-w-full w-full h-full flex flex-col justify-center p-6 shrink-0">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Setup Otak AI</h2>
                    <p className="text-slate-500 text-sm mb-6">Agar MyBrain berfungsi, dibutuhkan akses ke Google Gemini API.</p>
                    
                    {isEnvKeyDetected ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-green-800 text-sm">Mode Developer Aktif</h4>
                                <p className="text-xs text-green-700">API Key terdeteksi dari Environment Variable.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <h4 className="font-bold text-slate-700 text-xs uppercase mb-2">Cara Mendapatkan API Key:</h4>
                                <ol className="text-xs text-slate-600 space-y-2 list-decimal ml-4">
                                    <li>Kunjungi <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-indigo-600 font-bold underline">Google AI Studio</a>.</li>
                                    <li>Login dengan akun Google Anda.</li>
                                    <li>Klik "Create API Key" di proyek baru.</li>
                                    <li>Salin kuncinya (dimulai dengan 'AIza...')</li>
                                </ol>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Masukkan API Key Gemini</label>
                                <input 
                                    type="text" 
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="AIzaSy..."
                                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 font-mono text-sm"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 italic">
                                    *Key disimpan lokal di browser Anda. Aman & Privat.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* SLIDE 4: CREDITS & DONATION */}
                <div className="min-w-full w-full h-full flex flex-col justify-center p-6 shrink-0 text-center">
                    <div className="mb-8">
                         <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center">
                             <span className="text-3xl font-black text-slate-400">V</span>
                         </div>
                         <h2 className="text-xl font-bold text-slate-800">Created by Valmortheos</h2>
                         <p className="text-xs text-slate-400 mb-6 font-medium">Engineer, Designer & AI Enthusiast</p>
                         
                         {/* Social Links */}
                         <div className="space-y-3">
                             <a 
                                href="https://instagram.com/valmortheos" 
                                target="_blank"
                                onClick={() => triggerHaptic('light')}
                                className="flex items-center justify-between px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-pink-200 hover:bg-pink-50 transition-all active:scale-95 group"
                             >
                                 <div className="flex items-center gap-3">
                                     <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-pink-200 text-slate-600 group-hover:text-pink-700 transition-colors">
                                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                     </div>
                                     <span className="text-sm font-bold text-slate-700 group-hover:text-pink-900">Instagram</span>
                                 </div>
                                 <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-300 group-hover:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                             </a>

                             <a 
                                href="https://github.com/valmortheos" 
                                target="_blank"
                                onClick={() => triggerHaptic('light')}
                                className="flex items-center justify-between px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-95 group"
                             >
                                 <div className="flex items-center gap-3">
                                     <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-slate-300 text-slate-600 group-hover:text-slate-900 transition-colors">
                                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                     </div>
                                     <span className="text-sm font-bold text-slate-700">GitHub</span>
                                 </div>
                                 <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                             </a>
                         </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                        <p className="text-xs text-yellow-800 font-medium mb-3 leading-tight">
                            Project ini gratis. Dukung server & kopi developer:
                        </p>
                        <a 
                            href="https://saweria.co/vlmsc" 
                            target="_blank"
                            onClick={() => triggerHaptic('medium')}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-400 text-yellow-900 rounded-lg font-bold hover:bg-yellow-300 transition-all shadow-sm active:scale-95 text-xs w-full justify-center"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            Traktir di Saweria
                        </a>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-6 border-t border-slate-100 flex justify-between items-center z-10 bg-slate-50">
             <button 
                onClick={handleBack}
                className={`text-slate-400 font-bold text-sm hover:text-slate-600 px-2 py-1 transition-opacity ${step === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
             >
                 Kembali
             </button>

             <button 
                onClick={handleNext}
                disabled={step === 2 && !isEnvKeyDetected && apiKey.length < 10}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
                 {step === 3 ? "Mulai Eksplorasi" : "Lanjut"}
                 {step < 3 && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
             </button>
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;