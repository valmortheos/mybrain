import React, { useState } from 'react';
import { UserProfile, CognitiveMetrics, CognitiveGraphData, Message } from '../../types';

interface DevConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    userProfile: UserProfile;
    metrics: CognitiveMetrics;
    graphData: CognitiveGraphData;
    messages: Message[];
  }
}

const DevConsole: React.FC<DevConsoleProps> = ({ isOpen, onClose, data }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'metrics' | 'graph' | 'logs'>('profile');

  if (!isOpen) return null;

  const renderJSON = (obj: any) => {
    return (
      <pre className="text-[10px] md:text-xs font-mono text-emerald-400 bg-slate-900 p-4 rounded-xl overflow-auto h-full w-full border border-slate-700 shadow-inner selection:bg-emerald-900">
        {JSON.stringify(obj, null, 2)}
      </pre>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-800 w-full max-w-4xl h-[85vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
             <h2 className="text-sm font-bold text-white tracking-widest uppercase">MyBrain Developer Console</h2>
             <span className="px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 text-[10px] font-mono border border-indigo-700">DEBUG MODE</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800">
          {(['profile', 'metrics', 'graph', 'logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab 
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-4 bg-slate-800 relative">
           <div className="absolute top-4 right-6 text-[10px] text-slate-500 font-mono">
               readonly view
           </div>

           {activeTab === 'profile' && (
             <div className="h-full flex flex-col">
               <div className="mb-2 text-xs text-slate-400 font-medium">
                  Current State of <code className="text-emerald-400">userProfile</code>:
               </div>
               {renderJSON(data.userProfile)}
             </div>
           )}

           {activeTab === 'metrics' && (
             <div className="h-full flex flex-col">
               <div className="mb-2 text-xs text-slate-400 font-medium">
                  Current <code className="text-emerald-400">CognitiveMetrics</code> values:
               </div>
               {renderJSON(data.metrics)}
             </div>
           )}

           {activeTab === 'graph' && (
             <div className="h-full flex flex-col">
               <div className="mb-2 text-xs text-slate-400 font-medium">
                  Graph Topology ({data.graphData.nodes.length} Nodes, {data.graphData.links.length} Links):
               </div>
               {renderJSON(data.graphData)}
             </div>
           )}

           {activeTab === 'logs' && (
             <div className="h-full flex flex-col">
               <div className="mb-2 text-xs text-slate-400 font-medium">
                  Interaction History ({data.messages.length} Messages):
               </div>
               {renderJSON(data.messages)}
             </div>
           )}
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-700 flex justify-between items-center text-[10px] text-slate-500 font-mono">
           <span>Memory Usage: ~{(JSON.stringify(data).length / 1024).toFixed(2)} KB</span>
           <span>Session ID: {Date.now()}</span>
        </div>
      </div>
    </div>
  );
};

export default DevConsole;