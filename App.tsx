import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import NeuralGraph from './components/NeuralGraph';
import ChatInterface from './components/ChatInterface';
import MetricsPanel from './components/MetricsPanel';
import DiscoverySession from './components/DiscoverySession';
import SettingsPanel from './components/SettingsPanel'; 
import ShareModal from './components/ShareModal';
import OnboardingModal from './components/Onboarding/OnboardingModal';
import DevConsole from './components/DevTools/DevConsole'; // New Import
import { sendMessageToGemini } from './services/geminiService';
import { exportDataToJson, importDataFromJson } from './services/data/backupService';
import { db } from './services/data/db'; 
import { triggerHaptic } from './services/device/haptics'; 
import { CognitiveGraphData, Message, GraphNode, GraphLink, UserProfile, CognitiveMetrics } from './types';
import { INITIAL_NODES } from './constants';

type Tab = 'visual' | 'stream' | 'discovery' | 'analysis';

// Default empty profile
const INITIAL_PROFILE: UserProfile = {
  name: null,
  age: null,
  gender: null,
  mbti: null,
  careerAmbitions: [],
  hobbies: [],
  interests: [],
  likes: [],
  dislikes: [],
  personalityTraits: []
};

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'assistant',
  content: 'Halo! Aku MyBrain. Anggap aja aku teman ngobrol kamu. Lagi mikirin apa sekarang? Cerita yuk, aku siap dengerin.',
  timestamp: Date.now()
};

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<Tab>('stream'); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDevConsole, setShowDevConsole] = useState(false); // Dev Mode State
  
  // Data State
  const [graphData, setGraphData] = useState<CognitiveGraphData>({ nodes: JSON.parse(JSON.stringify(INITIAL_NODES)), links: [] });
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [metrics, setMetrics] = useState<CognitiveMetrics>({ analytical: 0, creative: 0, emotional: 0, memory: 0 });
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);

  const [loading, setLoading] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initApp = async () => {
        // 1. Check Onboarding Status
        const onboardingDone = localStorage.getItem('mybrain_onboarding_complete');
        if (!onboardingDone) {
            setShowOnboarding(true);
        }

        try {
            await db.init();
            const savedData = await db.loadState();
            
            if (savedData) {
                if (savedData.graphData) setGraphData(savedData.graphData);
                if (savedData.messages && savedData.messages.length > 0) setMessages(savedData.messages);
                if (savedData.metrics) setMetrics(savedData.metrics);
                if (savedData.userProfile) setUserProfile(savedData.userProfile);
            }
            setIsDbReady(true);
        } catch (err) {
            console.error("DB Init Failed", err);
            setIsDbReady(true);
        }
    };
    initApp();
  }, []);

  const handleOnboardingComplete = () => {
      localStorage.setItem('mybrain_onboarding_complete', 'true');
      setShowOnboarding(false);
      triggerHaptic('success');
  };
  
  // --- PERSISTENCE ---
  useEffect(() => {
    if (isDbReady) {
        db.saveState({
            graphData,
            messages,
            metrics,
            userProfile,
            version: '1.0.0'
        }).catch(err => console.error("Save failed", err));
    }
  }, [graphData, messages, metrics, userProfile, isDbReady]);

  // --- DATA MANAGEMENT HANDLERS ---
  const handleExportData = useCallback(() => {
    exportDataToJson(graphData, messages, metrics, userProfile);
    triggerHaptic('success');
  }, [graphData, messages, metrics, userProfile]);

  const handleImportData = useCallback(async (file: File) => {
    try {
      setLoading(true);
      const importedData = await importDataFromJson(file);
      setGraphData(importedData.graphData);
      setMessages(importedData.messages);
      setMetrics(importedData.metrics);
      setUserProfile(importedData.userProfile);
      triggerHaptic('success');
      alert("Data berhasil dipulihkan!");
      setIsSettingsOpen(false); 
    } catch (error) {
      console.error(error);
      triggerHaptic('error');
      alert(`Gagal import data: ${error instanceof Error ? error.message : "File rusak"}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFactoryReset = useCallback(async () => {
    await db.clear();
    setGraphData({ nodes: JSON.parse(JSON.stringify(INITIAL_NODES)), links: [] });
    setMessages([{ ...INITIAL_MESSAGE, timestamp: Date.now() }]);
    setMetrics({ analytical: 0, creative: 0, emotional: 0, memory: 0 });
    setUserProfile(INITIAL_PROFILE);
    setActiveTab('stream');
    triggerHaptic('heavy');
    // Force onboarding again on reset
    localStorage.removeItem('mybrain_onboarding_complete');
    setShowOnboarding(true);
    alert("Sistem berhasil di-reset ke pengaturan awal.");
  }, []);

  // --- AI LOGIC HANDLERS ---
  const mergeUnique = (current: string[], incoming: string[] | undefined) => {
    if (!incoming) return current;
    return Array.from(new Set([...current, ...incoming]));
  };

  const processInteraction = useCallback(async (text: string, mode: 'chat' | 'discovery') => {
    if (text) {
        triggerHaptic('light');
        const userMsg: Message = {
            id: uuidv4(),
            role: 'user',
            content: text,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);
    }
    
    setLoading(true);

    try {
      const history = messages.slice(-8).map(m => `${m.role === 'user' ? 'User' : 'MyBrain'}: ${m.content}`);
      const result = await sendMessageToGemini(history, text, userProfile, mode);

      const aiMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: result.reply,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
      triggerHaptic('medium');

      if (result.graphUpdates) {
        setGraphData(prev => {
          const newNodesRaw = result.graphUpdates?.newNodes || [];
          const newLinksRaw = result.graphUpdates?.newLinks || [];

          const existingIds = new Set(prev.nodes.map(n => n.id));
          const validNewNodes = newNodesRaw
            .filter(n => !existingIds.has(n.id))
            .map(n => ({ ...n } as GraphNode));

          const allNodeIds = new Set([...existingIds, ...validNewNodes.map(n => n.id)]);
          const validNewLinks = newLinksRaw
            .filter(l => allNodeIds.has(l.source as string) && allNodeIds.has(l.target as string))
            .map(l => ({ ...l } as GraphLink));

          if (validNewNodes.length === 0 && validNewLinks.length === 0) return prev;
          
          return {
            nodes: [...prev.nodes, ...validNewNodes],
            links: [...prev.links, ...validNewLinks]
          };
        });
      }

      if (result.metrics) {
        setMetrics(result.metrics);
      }

      if (result.profileUpdate) {
        setUserProfile(prev => {
            const updates = result.profileUpdate!;
            return {
                ...prev,
                name: updates.name !== undefined ? updates.name : prev.name,
                age: updates.age !== undefined ? updates.age : prev.age,
                gender: updates.gender !== undefined ? updates.gender : prev.gender,
                mbti: updates.mbti !== undefined ? updates.mbti : prev.mbti,
                careerAmbitions: mergeUnique(prev.careerAmbitions, updates.careerAmbitions),
                hobbies: mergeUnique(prev.hobbies, updates.hobbies),
                interests: mergeUnique(prev.interests, updates.interests),
                likes: mergeUnique(prev.likes, updates.likes),
                dislikes: mergeUnique(prev.dislikes, updates.dislikes),
                personalityTraits: mergeUnique(prev.personalityTraits, updates.personalityTraits),
            };
        });
      }

    } catch (error) {
      console.error("Interaction failed", error);
      triggerHaptic('error');
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: "Aduh, koneksiku agak putus-putus nih. Bisa ulang lagi gak?",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages, userProfile]);

  const handleChatSend = (text: string) => processInteraction(text, 'chat');
  const handleDiscoverySend = (text: string) => processInteraction(text, 'discovery');
  const handleDiscoveryStart = () => { triggerHaptic('medium'); processInteraction('', 'discovery'); };
  const switchTab = (tab: Tab) => { triggerHaptic('light'); setActiveTab(tab); };

  const lastAiMessage = messages.slice().reverse().find(m => m.role === 'assistant');

  return (
    <div className="w-full h-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Onboarding Overlay */}
      <OnboardingModal 
        isVisible={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />

      {/* Dev Console Modal */}
      <DevConsole 
        isOpen={showDevConsole}
        onClose={() => setShowDevConsole(false)}
        data={{
            userProfile,
            metrics,
            graphData,
            messages
        }}
      />

      {/* Modals */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onExport={handleExportData}
        onImport={handleImportData}
        onFactoryReset={handleFactoryReset}
        onOpenDevMode={() => setShowDevConsole(true)} // Pass Dev Mode Handler
      />

      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        userProfile={userProfile}
        metrics={metrics}
        nodeCount={graphData.nodes.length}
      />

      {/* 1. Header (FIXED POS) */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-4 z-50 transition-all shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shadow-slate-300 shadow-md">
             <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
           </div>
           <div className="flex items-baseline gap-1.5">
             <h1 className="font-bold text-slate-800 text-sm leading-tight tracking-tight">MyBrain</h1>
             <span className="text-[10px] font-normal text-slate-400">by Valmortheos</span>
           </div>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-1">
            <button 
                onClick={() => { triggerHaptic('light'); setIsShareOpen(true); }}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all active:scale-95"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
            </button>
            <button 
            onClick={() => { triggerHaptic('light'); setIsSettingsOpen(true); }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-95"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.581-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            </button>
        </div>
      </header>

      {/* 2. Main Content (FIXED POS BETWEEN HEADER AND FOOTER) */}
      <main className="fixed top-14 bottom-16 left-0 right-0 bg-slate-50 overflow-hidden">
        <div className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${activeTab === 'visual' ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 invisible pointer-events-none'}`}>
           <NeuralGraph data={graphData} />
        </div>
        <div className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${activeTab === 'stream' ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 invisible pointer-events-none'}`}>
           <ChatInterface messages={messages} onSendMessage={handleChatSend} isLoading={loading} />
        </div>
        <div className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${activeTab === 'discovery' ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 invisible pointer-events-none'}`}>
           <DiscoverySession lastAiMessage={lastAiMessage} onSendAnswer={handleDiscoverySend} onTriggerStart={handleDiscoveryStart} isLoading={loading} />
        </div>
        <div className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${activeTab === 'analysis' ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 invisible pointer-events-none'}`}>
           <MetricsPanel metrics={metrics} userProfile={userProfile} />
        </div>
      </main>

      {/* 3. Bottom Navigation (FIXED POS) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-between px-4 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={() => switchTab('visual')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-all active:scale-95 ${activeTab === 'visual' ? 'text-slate-800 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
          <div className={`p-1.5 rounded-full ${activeTab === 'visual' ? 'bg-slate-100' : 'bg-transparent'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m0 0l-2.25-1.313M3 14.25v2.25l2.25 1.313m0 0l2.25-1.313" />
            </svg>
          </div>
          <span className="text-[9px] font-bold tracking-wide">Peta</span>
        </button>

        <button onClick={() => switchTab('stream')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-all active:scale-95 ${activeTab === 'stream' ? 'text-slate-800 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
          <div className={`p-1.5 rounded-full ${activeTab === 'stream' ? 'bg-slate-100' : 'bg-transparent'} relative`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.286 3.423.379.35.028.71.04 1.065.04.322 0 .639-.006.953-.019 1.484-.061 2.955-.19 4.405-.378 1.583-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <span className="text-[9px] font-bold tracking-wide">Obrolan</span>
        </button>

        <button onClick={() => switchTab('discovery')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-all active:scale-95 ${activeTab === 'discovery' ? 'text-slate-800 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
          <div className={`p-1.5 rounded-full ${activeTab === 'discovery' ? 'bg-slate-100' : 'bg-transparent'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
             </svg>
          </div>
          <span className="text-[9px] font-bold tracking-wide">Tanya</span>
        </button>

        <button onClick={() => switchTab('analysis')} className={`flex flex-col items-center justify-center w-16 gap-1 transition-all active:scale-95 ${activeTab === 'analysis' ? 'text-slate-800 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
          <div className={`p-1.5 rounded-full ${activeTab === 'analysis' ? 'bg-slate-100' : 'bg-transparent'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="text-[9px] font-bold tracking-wide">Profil</span>
        </button>
      </nav>
    </div>
  );
};

export default App;