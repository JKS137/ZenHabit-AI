import React from 'react';
import { motion } from 'motion/react';
import { AnalyticsData } from '../hooks/useAnalytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Zap, Target, AlertTriangle, Link } from 'lucide-react';

interface Props {
  data: AnalyticsData;
  habits: any[];
}

export default function AdvancedAnalytics({ data, habits }: Props) {
  const chartData = habits.map(h => ({
    name: h.name.length > 8 ? h.name.substring(0, 8) + '...' : h.name,
    streak: data.streaks[h.id] || 0
  }));

  const pieData = [
    { name: 'Consistent', value: data.consistencyScore },
    { name: 'Gap', value: 100 - data.consistencyScore }
  ];

  return (
    <div className="space-y-8 p-1">
      {/* Overview Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1E293B]/70 p-5 rounded-3xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-[#8B5CF6] mb-2">
            <Zap size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Consistency</span>
          </div>
          <div className="text-3xl font-bold text-[#F8FAFC]">{data.consistencyScore}%</div>
          <div className="text-[10px] text-[#94A3B8] mt-1">Overall habit adherence rate</div>
        </div>
        <div className="bg-[#1E293B]/70 p-5 rounded-3xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-[#14B8A6] mb-2">
            <Target size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Top Streak</span>
          </div>
          <div className="text-3xl font-bold text-[#F8FAFC]">{Math.max(...Object.values(data.streaks), 0)}</div>
          <div className="text-[10px] text-[#94A3B8] mt-1">Days of uninterrupted growth</div>
        </div>
      </div>

      {/* Streak Chart */}
      <div className="bg-[#1E293B]/40 p-6 rounded-3xl border border-white/5">
        <h3 className="text-sm font-bold text-[#F8FAFC] mb-6 flex items-center gap-2 uppercase tracking-wider">
          <Link size={16} className="text-[#8B5CF6]" /> Longest Streaks
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
              />
              <Bar dataKey="streak" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8B5CF6' : '#14B8A6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Correlations */}
      {data.correlations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">Behavioral Correlations</h3>
          <div className="space-y-3">
            {data.correlations.map((corr, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-[#1E293B]/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#14B8A6]">{corr.habitA}</div>
                  <Link size={14} className="text-[#334155]" />
                  <div className="text-[#8B5CF6]">{corr.habitB}</div>
                </div>
                <div className="text-sm font-mono font-bold text-[#14B8A6]">{corr.score}%</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Low Performance Warning */}
      {data.lowCompletionDays.length > 0 && (
        <div className="bg-[#F43F5E]/10 p-5 rounded-3xl border border-[#F43F5E]/20 flex gap-4 items-center">
          <div className="bg-[#F43F5E] p-2 rounded-xl text-white">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F8FAFC]">Low Completion Warning</div>
            <div className="text-[10px] text-[#94A3B8]">Your consistency drops on: <span className="text-[#F43F5E] font-bold">{data.lowCompletionDays.join(', ')}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
