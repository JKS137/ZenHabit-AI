import React from 'react';
import { Recommendation } from '../hooks/useRecommendations';
import { motion } from 'motion/react';
import { Sparkles, ArrowUpRight, Dumbbell, Brain, Briefcase, Heart } from 'lucide-react';

interface Props {
  recommendations: Recommendation[];
  loading: boolean;
  onAdd: (name: string, category: string) => void;
}

const CategoryIcon = ({ cat }: { cat: string }) => {
  switch (cat.toLowerCase()) {
    case 'fitness': return <Dumbbell size={16} />;
    case 'mindfulness': return <Brain size={16} />;
    case 'productivity': return <Briefcase size={16} />;
    case 'health': return <Heart size={16} />;
    default: return <Sparkles size={16} />;
  }
};

export default function RecommendationList({ recommendations, loading, onAdd }: Props) {
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-[#1E293B]/30 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest flex items-center gap-2">
          <Sparkles size={14} className="text-[#8B5CF6]" /> AI Recommendations
        </h3>
      </div>
      
      {recommendations.map((rec, i) => (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          key={rec.id}
          className="bg-[#1E293B]/70 p-5 rounded-3xl border border-white/5 backdrop-blur-md relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-all"
        >
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="flex items-center gap-2 bg-[#8B5CF6]/10 text-[#8B5CF6] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <CategoryIcon cat={rec.category} />
              {rec.category}
            </div>
            <button 
              onClick={() => onAdd(rec.name, rec.category)}
              className="p-2 bg-[#14B8A6] rounded-xl text-white shadow-lg shadow-[#14B8A6]/20 hover:scale-110 active:scale-95 transition-all"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
          <h4 className="text-lg font-bold text-[#F8FAFC] mb-2 tracking-tight">{rec.name}</h4>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-2 italic">"{rec.reason}"</p>
          
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-[#8B5CF6]/5 rounded-full blur-xl group-hover:bg-[#8B5CF6]/10 transition-colors"></div>
        </motion.div>
      ))}
    </div>
  );
}
