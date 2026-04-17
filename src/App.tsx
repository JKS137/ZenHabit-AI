import { useAuth } from "./components/auth/AuthContext";
import HabitDashboard from "./components/HabitDashboard";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

function LoginScreen() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-sans text-[#F8FAFC]">
      <div className="max-w-md w-full space-y-12 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative inline-block"
        >
          <div className="w-32 h-32 bg-[#8B5CF6] rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-purple-500/20 animate-float mx-auto">
            <Sparkles size={64} fill="currentColor" />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-[#14B8A6] p-3 rounded-2xl shadow-xl border border-white/10 text-white">
            <Sparkles size={24} />
          </div>
        </motion.div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">ZenHabit <span className="text-[#14B8A6]">AI</span></h1>
          <p className="text-[#94A3B8] leading-relaxed max-w-[20ch] mx-auto text-lg font-medium">
            Master your routines with artificial intelligence and behavioral science.
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={login}
            className="w-full group bg-[#8B5CF6] text-white rounded-3xl py-5 px-8 font-bold text-lg shadow-xl shadow-purple-500/20 hover:bg-[#7C3AED] transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            Get Started with Google
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-xs text-[#94A3B8]">Secure. Private. Powered by Gemini.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-12">
          <div className="bg-[#1E293B]/70 p-6 rounded-3xl border border-white/10 text-left backdrop-blur-sm">
            <div className="text-[#8B5CF6] mb-2"><TrendingUpIcon size={20} /></div>
            <div className="text-sm font-bold">Smart Analysis</div>
            <div className="text-[10px] text-[#94A3B8]">Patterns detected by AI to optimize your growth.</div>
          </div>
          <div className="bg-[#1E293B]/70 p-6 rounded-3xl border border-white/10 text-left backdrop-blur-sm">
            <div className="text-[#14B8A6] mb-2"><AwardIcon size={20} /></div>
            <div className="text-sm font-bold">Badges & XP</div>
            <div className="text-[10px] text-[#94A3B8]">Stay motivated with a rewarding tracker system.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingUpIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
}

function AwardIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? <HabitDashboard /> : <LoginScreen />;
}
