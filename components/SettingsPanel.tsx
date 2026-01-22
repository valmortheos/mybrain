import React, { useState, useRef, useEffect } from 'react';
import { triggerHaptic } from '../services/device/haptics';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onFactoryReset: () => void;
  onOpenDevMode: () => void; // New prop
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  onExport, 
  onImport, 
  onFactoryReset,
  onOpenDevMode 
}) => {
  const [resetCode, setResetCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  
  // Dev Mode States
  const [devPin, setDevPin] = useState('');
  const [isDevInputVisible, setIsDevInputVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate random code saat mode reset aktif
  useEffect(() => {
    if (isResetMode) {
      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      setResetCode(`RESET-${randomString}`);
      setInputCode('');
    }
  }, [isResetMode]);

  // Reset states when closed
  useEffect(() => {
    if (!isOpen) {
        setIsResetMode(false);
        setIsDevInputVisible(false);
        setDevPin('');
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetConfirm = () => {
    if (inputCode === resetCode) {
      onFactoryReset();
      setIsResetMode(false);
      onClose();
    }
  };

  const handleDevPinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (devPin === '2477') {
          triggerHaptic('success');
          onOpenDevMode();
          onClose();
      } else {
          triggerHaptic('error');
          alert("Akses Ditolak: PIN Salah.");
          setDevPin('');
      }
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] transition-all duration-300 ease-in-out ${isOpen ? 'visible' : 'invisible'}`}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Slide-over Panel - Increased Z-Index to cover everything */}
      <div 
        className={`absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out z-[101] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white">
            <h2 className="text-lg font-bold text-slate-800">Pengaturan</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-8 bg-slate-50">
            
            {/* Data Management Section */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Data & Penyimpanan</h3>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={onExport}
                  className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-slate-700">Export JSON</div>
                      <div className="text-[10px] text-slate-400">Unduh cadangan data</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-slate-700">Import JSON</div>
                      <div className="text-[10px] text-slate-400">Pulihkan data lama</div>
                    </div>
                  </div>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
              </div>
            </section>

            {/* Developer Mode Section */}
            <section className="pt-6 border-t border-slate-200">
                <div 
                    className="flex items-center justify-between mb-4 cursor-pointer"
                    onClick={() => setIsDevInputVisible(!isDevInputVisible)}
                >
                    <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Developer Mode</h3>
                    <div className={`text-indigo-400 transition-transform ${isDevInputVisible ? 'rotate-180' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                {isDevInputVisible && (
                    <form onSubmit={handleDevPinSubmit} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                        <p className="text-[10px] text-indigo-700 font-medium mb-3">
                            Masukkan PIN untuk membuka Console Debug & Metrics Viewer.
                        </p>
                        <div className="flex gap-2">
                            <input 
                                type="password" 
                                value={devPin}
                                onChange={(e) => setDevPin(e.target.value)}
                                placeholder="PIN Akses"
                                maxLength={4}
                                className="flex-1 px-3 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-center font-mono tracking-widest"
                            />
                            <button 
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                            >
                                Buka
                            </button>
                        </div>
                    </form>
                )}
            </section>

            {/* Danger Zone */}
            <section className="pt-6 border-t border-slate-200">
              <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4">Zona Bahaya</h3>
              
              {!isResetMode ? (
                <button 
                  onClick={() => setIsResetMode(true)}
                  className="w-full py-4 border border-rose-200 text-rose-600 bg-white rounded-xl text-sm font-bold hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Hapus Semua Data
                </button>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-xs text-rose-700 font-medium mb-3">
                    Tindakan ini tidak dapat dibatalkan. Semua grafik, memori chat, dan profil akan dihapus permanen.
                  </p>
                  <div className="mb-3">
                    <label className="text-[10px] text-rose-500 font-bold uppercase block mb-1">
                      Ketik: <span className="select-all bg-white px-1 rounded border border-rose-200 text-rose-800">{resetCode}</span>
                    </label>
                    <input 
                      type="text" 
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Konfirmasi kode..."
                      className="w-full px-3 py-2 text-sm border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white text-rose-900"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsResetMode(false)}
                      className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleResetConfirm}
                      disabled={inputCode !== resetCode}
                      className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Hapus Permanen
                    </button>
                  </div>
                </div>
              )}
            </section>

          </div>
          
          {/* Footer Info */}
          <div className="p-5 border-t border-slate-200 bg-slate-50 text-center">
            <p className="text-[10px] text-slate-400">MyBrain v1.0.0 • Valmortheos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;