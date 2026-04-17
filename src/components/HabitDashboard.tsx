import React, { useState } from 'react';
import { useHabits, Habit } from '../hooks/useHabits';
import { Plus, Check, Trash2, TrendingUp, Award, User, Bell, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import { format, startOfToday } from 'date-fns';
import { getHabitInsights, HabitInsight } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getHabitCompletionData } from '../lib/utils';

import { useAnalytics } from '../hooks/useAnalytics';
import { useRecommendations } from '../hooks/useRecommendations';
import AdvancedAnalytics from './AdvancedAnalytics';
import RecommendationList from './RecommendationList';
import HealthConnect from './HealthConnect';
import { BarChart2, Activity } from 'lucide-react';

export default function HabitDashboard() {
  const { habits, logs, loading, addHabit, toggleHabit, deleteHabit } = useHabits();
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'ai' | 'health'>('home');
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', goalValue: 1, unit: 'times', frequency: 'daily' });
  const [formErrors, setFormErrors] = useState<{ name?: string; goalValue?: string; unit?: string }>({});
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [insight, setInsight] = useState<HabitInsight | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyticsData = useAnalytics(habits, logs);
  const { recommendations, loading: recsLoading, refresh: refreshRecs } = useRecommendations(habits, profile);

  const todayStr = format(startOfToday(), 'yyyy-MM-dd');

  const validateForm = () => {
    const errors: { name?: string; goalValue?: string; unit?: string } = {};
    if (!newHabit.name.trim()) errors.name = 'Habit name is required';
    if (newHabit.goalValue <= 0) errors.goalValue = 'Goal must be a positive number';
    if (!newHabit.unit.trim()) errors.unit = 'Unit is required (e.g., times, mins)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddHabit = async (e?: React.FormEvent, customData?: any) => {
    if (e) e.preventDefault();
    
    // Skip complex validation if it's customData (e.g. from recommendations)
    if (!customData && !validateForm()) return;

    await addHabit(customData || newHabit);
    setIsAdding(false);
    setNewHabit({ name: '', goalValue: 1, unit: 'times', frequency: 'daily' });
    setFormErrors({});
  };

  const fetchInsights = async (habit: Habit) => {
    setAnalyzing(true);
    const habitLogs = logs.filter(l => l.habitId === habit.id);
    const result = await getHabitInsights(habit.name, habitLogs.map(l => ({ date: l.date, completed: l.completed })));
    setInsight(result);
    setSelectedHabitId(habit.id);
    setAnalyzing(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center font-sans text-[#F8FAFC]">
    <div className="animate-pulse text-[#14B8A6] font-medium">Loading your journey...</div>
  </div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#0F172A] font-sans pb-20 shadow-xl overflow-x-hidden text-[#F8FAFC]">
      {/* Header */}
      <header className="p-6 pb-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ZenHabit <span className="text-[#14B8A6]">AI</span></h1>
            <p className="text-[#94A3B8] text-sm">Welcome back, {profile?.name}</p>
          </div>
          <button onClick={() => logout()} className="p-2 rounded-full bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155] transition-colors border border-white/5">
            <User size={20} />
          </button>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-3xl p-6 text-white mb-6 shadow-lg shadow-purple-500/10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-100 text-xs font-semibold uppercase tracking-wider">Total Progress</span>
              <Award size={20} className="text-[#14B8A6]" />
            </div>
            <div className="text-3xl font-bold mb-1 tracking-tight">{profile?.points || 0} Points</div>
            <div className="text-purple-100 text-xs">{profile?.badges?.length || 0} Badges earned • Keep it up!</div>
          </div>
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Action Row */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex-1 bg-[#1E293B]/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 hover:border-[#8B5CF6]/50 transition-all hover:bg-[#1E293B]/80 group"
          >
            <div className="p-2 bg-[#8B5CF6]/10 rounded-xl text-[#8B5CF6] group-hover:scale-110 transition-transform">
               <Plus size={24} />
            </div>
            <span className="text-xs font-bold text-[#F8FAFC]">Add Habit</span>
          </button>
          <button className="flex-1 bg-[#1E293B]/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 hover:border-[#14B8A6]/50 transition-all hover:bg-[#1E293B]/80 group">
             <div className="p-2 bg-[#14B8A6]/10 rounded-xl text-[#14B8A6] group-hover:scale-110 transition-transform">
               <Bell size={24} />
            </div>
            <span className="text-xs font-bold text-[#F8FAFC]">Reminders</span>
          </button>
        </div>
      </header>

      {/* Dynamic Content based on Active Tab */}
      <main className="px-6 pb-4 min-h-[60vh]">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-sm font-bold text-[#94A3B8] uppercase tracking-widest flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-[#14B8A6]" />
                Today's Habits
              </h2>
              {habits.length === 0 ? (
                <div className="text-center py-10 bg-[#1E293B]/30 rounded-3xl border-2 border-dashed border-white/5">
                  <Sparkles className="mx-auto text-[#14B8A6]/40 mb-2" size={32} />
                  <p className="text-[#94A3B8] text-sm tracking-tight">No habits yet. Start small.</p>
                </div>
              ) : (
                habits.map((habit) => {
                  const isCompletedToday = logs.some(l => l.habitId === habit.id && l.date === todayStr && l.completed);
                  const isSelected = selectedHabitId === habit.id;

                  return (
                    <motion.div 
                      key={habit.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`habit-pill p-5 ${isCompletedToday ? 'border-[#14B8A6]/30 bg-[#14B8A6]/5' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <button 
                          onClick={() => toggleHabit(habit.id, 0, habit.goalValue)}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isCompletedToday ? 'bg-[#14B8A6] text-white shadow-lg shadow-[#14B8A6]/20' : 'bg-[#1E293B] text-[#334155] border border-white/5 hover:border-[#8B5CF6]'}`}
                        >
                          <Check size={24} strokeWidth={3} />
                        </button>
                        <div className="flex-1 min-w-0" onClick={() => fetchInsights(habit)}>
                          <h3 className={`font-semibold text-[#F8FAFC] truncate ${isCompletedToday ? 'opacity-50 line-through' : ''}`}>{habit.name}</h3>
                          <p className="text-xs text-[#94A3B8] flex items-center gap-1 font-medium">
                            <Calendar size={12} /> {habit.frequency} • {habit.goalValue} {habit.unit}
                          </p>
                        </div>
                        <button onClick={() => deleteHabit(habit.id)} className="text-[#334155] hover:text-[#F43F5E] transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-4 pt-4 border-t border-white/5 overflow-hidden"
                          >
                             {analyzing ? (
                               <div className="flex items-center gap-2 text-xs text-[#8B5CF6] animate-pulse py-2 font-medium">
                                 <Sparkles size={14} /> AI Analyzing patterns...
                               </div>
                             ) : insight ? (
                               <div className="space-y-4">
                                  <div className="h-24 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={getHabitCompletionData(logs.filter(l => l.habitId === habit.id))}>
                                        <Line type="monotone" dataKey="completed" stroke="#14B8A6" strokeWidth={3} dot={false} />
                                        <XAxis dataKey="date" hide />
                                        <YAxis hide domain={[0, 1.2]} />
                                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', background: '#1E293B', color: '#F8FAFC' }} />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                  <div className="ai-banner-gradient p-4 rounded-2xl text-xs text-[#F8FAFC]">
                                    <p className="font-bold text-[#8B5CF6] mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                                      <Sparkles size={14} /> AI Smart Insight
                                    </p>
                                    <p className="mb-2 italic text-[#94A3B8] leading-relaxed line-clamp-2">"{insight.analysis}"</p>
                                    <p className="text-[#F8FAFC] bg-white/5 p-3 rounded-xl border border-white/5">{insight.suggestion}</p>
                                  </div>
                               </div>
                             ) : null}
                             <button onClick={() => setSelectedHabitId(null)} className="w-full text-center text-xs text-[#94A3B8] py-2 hover:text-[#F8FAFC] transition-colors font-medium">Hide stats</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AdvancedAnalytics data={analyticsData} habits={habits} />
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div 
              key="ai"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <RecommendationList 
                recommendations={recommendations} 
                loading={recsLoading}
                onAdd={(name, cat) => handleAddHabit(undefined, { name, goalValue: 1, unit: 'times', frequency: 'daily' })}
              />
            </motion.div>
          )}

          {activeTab === 'health' && (
            <motion.div 
              key="health"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <HealthConnect onStatusChange={(conn) => console.log('Connected', conn)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm" onClick={() => setIsAdding(false)} 
             />
             <motion.div 
               initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
               className="bg-[#1E293B] w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl p-8 relative z-10 shadow-2xl border-t border-white/5"
             >
               <h2 className="text-xl font-bold mb-6 text-[#F8FAFC] tracking-tight">New Habit</h2>
               <form onSubmit={handleAddHabit} className="space-y-6">
                 <div>
                   <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-2">What's the habit?</label>
                   <input 
                     className={`w-full text-lg border-b ${formErrors.name ? 'border-rose-500' : 'border-white/10'} focus:border-[#8B5CF6] outline-none pb-2 bg-transparent transition-all placeholder:text-[#334155]`}
                     placeholder="e.g., Read Quran"
                     value={newHabit.name}
                     onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
                   />
                   {formErrors.name && <p className="text-[10px] text-rose-500 mt-1 font-bold">{formErrors.name}</p>}
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Goal</label>
                     <input 
                       type="number"
                       className={`w-full border-b ${formErrors.goalValue ? 'border-rose-500' : 'border-white/10'} focus:border-[#8B5CF6] outline-none pb-2 bg-transparent`}
                       value={newHabit.goalValue}
                       onChange={e => setNewHabit({ ...newHabit, goalValue: Number(e.target.value) })}
                     />
                     {formErrors.goalValue && <p className="text-[10px] text-rose-500 mt-1 font-bold">{formErrors.goalValue}</p>}
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Unit</label>
                     <input 
                       className={`w-full border-b ${formErrors.unit ? 'border-rose-500' : 'border-white/10'} focus:border-[#8B5CF6] outline-none pb-2 bg-transparent`}
                       placeholder="mins, times, L"
                       value={newHabit.unit}
                       onChange={e => setNewHabit({ ...newHabit, unit: e.target.value })}
                     />
                     {formErrors.unit && <p className="text-[10px] text-rose-500 mt-1 font-bold">{formErrors.unit}</p>}
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Frequency</label>
                   <select 
                     className="w-full border-b border-white/10 focus:border-[#8B5CF6] outline-none pb-2 bg-transparent appearance-none"
                     value={newHabit.frequency}
                     onChange={e => setNewHabit({ ...newHabit, frequency: e.target.value })}
                   >
                     <option value="daily" className="bg-[#1E293B]">Daily</option>
                     <option value="weekly" className="bg-[#1E293B]">Weekly</option>
                     <option value="custom" className="bg-[#1E293B]">Custom</option>
                   </select>
                 </div>
                 <button type="submit" className="w-full bg-[#8B5CF6] text-white rounded-2xl py-4 font-bold shadow-lg shadow-purple-500/20 hover:bg-[#7C3AED] active:scale-95 transition-all">
                   Create Habit
                 </button>
               </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Nav */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#0F172A]/90 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex justify-around max-w-md mx-auto z-40">
         <button 
           onClick={() => setActiveTab('home')}
           className={`${activeTab === 'home' ? 'text-[#14B8A6]' : 'text-[#94A3B8]'} transition-colors`}
         >
           <TrendingUp size={24} />
         </button>
         <button 
           onClick={() => setActiveTab('analytics')}
           className={`${activeTab === 'analytics' ? 'text-[#14B8A6]' : 'text-[#94A3B8]'} transition-colors`}
         >
           <BarChart2 size={24} />
         </button>
         <button className="text-white relative -top-6">
           <div 
             onClick={() => setIsAdding(true)}
             className="bg-[#8B5CF6] rounded-2xl p-4 shadow-xl shadow-purple-500/40 hover:scale-110 active:scale-95 transition-all"
           >
             <Plus size={28} />
           </div>
         </button>
         <button 
           onClick={() => setActiveTab('ai')}
           className={`${activeTab === 'ai' ? 'text-[#14B8A6]' : 'text-[#94A3B8]'} transition-colors`}
         >
           <Sparkles size={24} />
         </button>
         <button 
           onClick={() => setActiveTab('health')}
           className={`${activeTab === 'health' ? 'text-[#14B8A6]' : 'text-[#94A3B8]'} transition-colors`}
         >
           <Activity size={24} />
         </button>
      </footer>
    </div>
  );
}
