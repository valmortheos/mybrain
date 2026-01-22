import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { UserProfile, CognitiveMetrics } from '../types';
import Skeleton from './ui/Skeleton';

interface MetricsPanelProps {
  metrics: CognitiveMetrics;
  userProfile: UserProfile;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, userProfile }) => {
  const data = [
    { subject: 'Analitik', A: metrics.analytical, fullMark: 100 },
    { subject: 'Kreatif', A: metrics.creative, fullMark: 100 },
    { subject: 'Emosional', A: metrics.emotional, fullMark: 100 },
    { subject: 'Memori', A: metrics.memory, fullMark: 100 },
  ];

  // Logic: Jika semua metric 0, berarti belum ada data.
  const totalScore = metrics.analytical + metrics.creative + metrics.emotional + metrics.memory;
  const dominant = totalScore > 0 
    ? Object.entries(metrics).reduce((a, b) => a[1] > b[1] ? a : b)
    : ["Menunggu Data", 0];

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 overflow-y-auto pb-32 scroll-smooth"> 
      
      {/* 1. User Identity Card */}
      <div className="flex-shrink-0 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-32 h-32">
               <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div>
                     <h2 className="text-2xl font-bold text-slate-800 tracking-tight break-words">
                        {userProfile.name || "Anonim"}
                     </h2>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold border border-slate-200">
                          {userProfile.gender ? userProfile.gender : "?"}
                        </span>
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                          • {userProfile.age !== null ? `${userProfile.age} Tahun` : "Umur ?"}
                        </span>
                     </div>
                </div>
                
                {/* MBTI Badge */}
                {userProfile.mbti ? (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">MBTI</span>
                    <span className="bg-slate-800 text-white text-sm font-black px-2 py-1 rounded-lg shadow-md tracking-wide">
                      {userProfile.mbti}
                    </span>
                  </div>
                ) : (
                    <div className="flex flex-col items-end opacity-50">
                        <Skeleton className="w-8 h-3 mb-1" />
                        <Skeleton className="w-12 h-6" />
                    </div>
                )}
            </div>

            {/* Personality Traits Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                {userProfile.personalityTraits.length > 0 ? (
                    userProfile.personalityTraits.map((trait, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200">
                            {trait}
                        </span>
                    ))
                ) : (
                    <div className="flex gap-2">
                        <Skeleton className="w-16 h-5 rounded-full" />
                        <Skeleton className="w-20 h-5 rounded-full" />
                        <Skeleton className="w-12 h-5 rounded-full" />
                    </div>
                )}
            </div>

            {/* Career Ambitions Section (New) */}
            {userProfile.careerAmbitions && userProfile.careerAmbitions.length > 0 && (
              <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Potensi Karir & Arah Hidup</h4>
                <div className="flex flex-wrap gap-1.5">
                  {userProfile.careerAmbitions.map((career, idx) => (
                    <span key={idx} className="text-xs font-semibold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Likes / Dislikes Grid */}
            <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-50">
                <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span> Disukai
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-1.5 pl-1 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                        {userProfile.likes.length > 0 ? userProfile.likes.map((l, i) => <li key={i}>• {l}</li>) : <li className="italic text-slate-300">Belum ada data</li>}
                    </ul>
                </div>
                <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> Dihindari
                    </h4>
                    <ul className="text-xs text-slate-500 space-y-1.5 pl-1 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                         {userProfile.dislikes.length > 0 ? userProfile.dislikes.map((d, i) => <li key={i}>• {d}</li>) : <li className="italic text-slate-300">Belum ada data</li>}
                    </ul>
                </div>
            </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex-none h-[35vh] mb-4 relative overflow-hidden">
        <div className="absolute top-4 left-0 right-0 text-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Spektrum Otak</h3>
        </div>
        {totalScore > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="55%" outerRadius="70%" data={data}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                name="MyBrain"
                dataKey="A"
                stroke="#475569"
                strokeWidth={3}
                fill="#94a3b8"
                fillOpacity={0.4}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#475569', fontSize: '12px', fontWeight: 'bold' }}
                />
            </RadarChart>
            </ResponsiveContainer>
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-t-slate-300 animate-spin mb-4 opacity-50"></div>
                <p className="text-xs text-slate-400 font-medium">Mengumpulkan data kognitif...</p>
            </div>
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Dominan</div>
            {totalScore > 0 ? (
                <div className="text-lg font-bold text-slate-700 capitalize">{dominant[0]}</div>
            ) : (
                <div className="text-sm font-semibold text-slate-400 italic">Belum terdeteksi</div>
            )}
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Minat Utama</div>
            <div className="text-xs font-bold text-slate-700 leading-tight">
                {userProfile.interests.length > 0 ? userProfile.interests.slice(0, 3).join(", ") : <span className="text-slate-400 italic font-medium">Belum terdeteksi</span>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;