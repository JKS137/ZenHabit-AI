import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';

interface Props {
  onStatusChange: (connected: boolean) => void;
}

export default function HealthConnect({ onStatusChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_FIT_AUTH_SUCCESS') {
        setConnected(true);
        onStatusChange(true);
        // Save tokens to localStorage or session for demo
        localStorage.setItem('google_fit_tokens', JSON.stringify(event.data.tokens));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        url,
        'google_fit_auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-4 rounded-2xl transition-all duration-500 ${connected ? 'bg-[#14B8A6]/20 text-[#14B8A6]' : 'bg-[#1E293B] text-[#94A3B8] border border-white/5 animate-pulse'}`}>
          <Activity size={32} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#F8FAFC] tracking-tight">Wearable Sync</h3>
          <p className="text-xs text-[#94A3B8]">
            {connected ? 'Auto-tracking active (Steps, Sleep, Health)' : 'Connect Google Fit to automate your habits.'}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3 relative z-10">
        {connected ? (
          <div className="flex-1 bg-[#14B8A6]/10 text-[#14B8A6] py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border border-[#14B8A6]/20">
            <ShieldCheck size={16} /> Linked to Google Fit
          </div>
        ) : (
          <button 
            disabled={loading}
            onClick={handleConnect}
            className="flex-1 bg-[#8B5CF6] text-white py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs shadow-lg shadow-purple-500/20 hover:bg-[#7C3AED] transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <ExternalLink size={16} />}
            Connect Health Data
          </button>
        )}
      </div>

      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-[#14B8A6]/5 rounded-full blur-2xl group-hover:bg-[#14B8A6]/10 transition-colors"></div>
    </div>
  );
}
