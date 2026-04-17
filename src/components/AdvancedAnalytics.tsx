import React from 'react';
import { motion } from 'motion/react';
import { AnalyticsData } from '../hooks/useAnalytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Zap, Target, AlertTriangle, Link, Clock, TrendingUp } from 'lucide-react';

interface Props {
  data: AnalyticsData;
  habits: any[];
}

export default function AdvancedAnalytics({ data, habits }: Props) {
  const streakData = habits.map(h => ({
    name: h.name.length > 8 ? h.name.substring(0, 8) + '...' : h.name,
    streak: data.streaks[h.id] || 0
  }));

  return (
    <div className="space-y-8 p-1">
      {/* Overview Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1E293B]/70 p-5 rounded-3xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-[#8B5CF6] mb-2">
            <Zap size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Consistency</span>
          </div>
          <div className="text-3xl font-bold text-[#F8FAFC] tracking-tight">{data.consistencyScore}%</div>
          <div className="text-[10px] text-[#94A3B8] mt-1">Average adherence rate</div>
        </div>
        <div className="bg-[#1E293B]/70 p-5 rounded-3xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-[#14B8A6] mb-2">
            <Target size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Max Streak</span>
          </div>
          <div className="text-3xl font-bold text-[#F8FAFC] tracking-tight">{Math.max(...Object.values(data.streaks), 0)}</div>
          <div className="text-[10px] text-[#94A3B8] mt-1">Days of momentum</div>
        </div>
      </div>

      {/* Consistency Trend */}
      <div className="bg-[#1E293B]/40 p-6 rounded-3xl border border-white/5">
        <h3 className="text-sm font-bold text-[#F8FAFC] mb-6 flex items-center gap-2 uppercase tracking-wider">
          <TrendingUp size={16} className="text-[#8B5CF6]" /> Consistency Trend
        </h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.consistencyTrend}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '12px', fontSize: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#8B5CF6' }}
              />
              <Area type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Activity */}
      <div className="bg-[#1E293B]/40 p-6 rounded-3xl border border-white/5">
        <h3 className="text-sm font-bold text-[#F8FAFC] mb-6 flex items-center gap-2 uppercase tracking-wider">
          <Clock size={16} className="text-[#14B8A6]" /> Peak Activity Times
        </h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.hourlyActivity}>
              <XAxis dataKey="hour" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(h) => `${h}h`} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '12px', fontSize: '10px' }}
              />
              <Bar dataKey="completions" radius={[4, 4, 0, 0]}>
                {data.hourlyActivity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.completions > 2 ? '#14B8A6' : '#1E293B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-[#94A3B8] mt-4 text-center">Your habits are most often completed during typical morning and evening windows.</p>
      </div>

      {/* Streak Chart */}
      <div className="bg-[#1E293B]/40 p-6 rounded-3xl border border-white/5">
        <h3 className="text-sm font-bold text-[#F8FAFC] mb-6 flex items-center gap-2 uppercase tracking-wider">
          <Link size={16} className="text-[#8B5CF6]" /> Longest Streaks
        </h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={streakData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={60} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '12px', fontSize: '10px' }}
              />
              <Bar dataKey="streak" radius={[0, 6, 6, 0]}>
                {streakData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8B5CF6' : '#14B8A6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Correlations */}
      {data.correlations.length > 0 && (
        <div className="space-y-4 px-2">
          <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest px-1">Behavioral Correlations</h3>
          <div className="space-y-3">
            {data.correlations.map((corr, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-[#1E293B]/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#8B5CF6]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold text-[#F8FAFC]">{corr.habitA}</div>
                  <div className="h-px w-4 bg-[#334155] group-hover:bg-[#8B5CF6] transition-colors" />
                  <div className="text-xs font-bold text-[#F8FAFC]">{corr.habitB}</div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="text-[10px] font-mono text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-1 rounded-md">+{corr.score}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Low Performance Warning */}
      {data.lowCompletionDays.length > 0 && (
        <div className="bg-[#F43F5E]/10 p-5 rounded-3xl border border-[#F43F5E]/20 flex gap-4 items-center mx-2">
          <div className="bg-[#F43F5E] p-2 rounded-xl text-white shadow-lg shadow-rose-500/20">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F8FAFC]">Consistency Drop Warning</div>
            <div className="text-[10px] text-[#94A3B8]">Performance significantly decreases on: <span className="text-[#F43F5E] font-bold">{data.lowCompletionDays.join(', ')}</span></div>
          </div>
        </div>
      )}
      
      <div className="pb-10" />
    </div>
  );
}
